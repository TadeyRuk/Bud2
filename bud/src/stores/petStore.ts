import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DbPet, PetStatus } from "../types/database";
import { supabase, supabaseConfigured } from "../lib/supabase";
import { normalizeError } from "../lib/api";
import { enqueue, dequeue, peekAll, getBlob } from "../lib/offlineQueue";
import { uploadPetPhoto, resizeImage } from "../lib/storage";
import { DEMO_PETS } from "../data/pets";

export type Pet = DbPet & {
  syncing?: boolean;
  date?: string;
  pin?: { topPct: number; leftPct: number };
};

type PetState = {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchPets: (reset?: boolean) => Promise<void>;
  searchPets: (query: string) => Promise<void>;
  addPet: (pet: Omit<DbPet, "id" | "created_at" | "updated_at" | "reporter_id">, photo?: File) => Promise<{ error: string | null }>;
  updatePetStatus: (petId: string, status: PetStatus) => Promise<{ error: string | null }>;
  subscribeRealtime: () => () => void;
  drainOfflineQueue: () => Promise<void>;
};

const PAGE_SIZE = 10;

function mapDemoPets(): Pet[] {
  return DEMO_PETS.map((d) => ({
    id: d.id,
    reporter_id: "",
    name: d.name,
    breed: d.breed ?? null,
    color: d.color,
    fur_color: d.furColor,
    gender: d.gender,
    status: d.status as PetStatus,
    type: d.type as "dog" | "cat" | "other",
    location_text: d.location,
    lat: d.lat ?? null,
    lng: d.lng ?? null,
    image_url: d.image,
    description: d.description,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    date: d.date,
    pin: d.pin,
  }));
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: [],
      loading: false,
      error: null,
      hasMore: true,

      fetchPets: async (reset = false) => {
        if (!supabaseConfigured) {
          set({ pets: mapDemoPets(), loading: false, hasMore: false });
          return;
        }

        set({ loading: true, error: null });
        const current = reset ? [] : get().pets;
        const cursor = reset ? undefined : current[current.length - 1]?.created_at;

        let query = supabase
          .from("pets")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(PAGE_SIZE);

        if (cursor) {
          query = query.lt("created_at", cursor);
        }

        const { data, error } = await query;

        if (error) {
          set({ loading: false, error: normalizeError(error) });
          if (get().pets.length === 0) {
            set({ pets: mapDemoPets() });
          }
          return;
        }

        const fetched = (data as DbPet[]).map((d) => ({ ...d } as Pet));
        set({
          pets: reset ? fetched : [...current, ...fetched],
          loading: false,
          hasMore: fetched.length === PAGE_SIZE,
        });
      },

      searchPets: async (query: string) => {
        const q = query.trim();
        if (!q) {
          await get().fetchPets(true);
          return;
        }

        if (!supabaseConfigured) {
          const demos = mapDemoPets();
          const lq = q.toLowerCase();
          set({
            pets: demos.filter(
              (p) =>
                p.name.toLowerCase().includes(lq) ||
                p.location_text.toLowerCase().includes(lq) ||
                (p.breed?.toLowerCase().includes(lq) ?? false)
            ),
          });
          return;
        }

        set({ loading: true, error: null });
        const pattern = `%${q}%`;
        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .or(`name.ilike.${pattern},location_text.ilike.${pattern},breed.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .limit(30);

        if (error) {
          const lq = q.toLowerCase();
          set({
            loading: false,
            pets: get().pets.filter(
              (p) =>
                p.name.toLowerCase().includes(lq) ||
                p.location_text.toLowerCase().includes(lq) ||
                (p.breed?.toLowerCase().includes(lq) ?? false)
            ),
          });
          return;
        }

        set({ pets: (data as DbPet[]).map((d) => ({ ...d } as Pet)), loading: false, hasMore: false });
      },

      addPet: async (petData, photo) => {
        const tempId = crypto.randomUUID();
        const tempPet: Pet = {
          id: tempId,
          reporter_id: "",
          ...petData,
          image_url: photo ? URL.createObjectURL(photo) : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          syncing: true,
        };

        set((s) => ({ pets: [tempPet, ...s.pets] }));

        if (!supabaseConfigured) {
          set((s) => ({
            pets: s.pets.map((p) => (p.id === tempId ? { ...p, syncing: false } : p)),
          }));
          return { error: null };
        }

        try {
          let imageUrl: string | null = null;
          if (photo) {
            const resized = await resizeImage(photo);
            imageUrl = await uploadPetPhoto(resized, tempId);
          }

          const { data, error } = await supabase
            .from("pets")
            .insert({
              ...petData,
              image_url: imageUrl,
              reporter_id: (await supabase.auth.getUser()).data.user?.id ?? "",
            })
            .select()
            .single();

          if (error) throw error;

          set((s) => ({
            pets: s.pets.map((p) =>
              p.id === tempId ? { ...(data as DbPet), syncing: false } : p
            ),
          }));

          return { error: null };
        } catch (err) {
          if (photo) {
            await enqueue(
              { table: "pets", operation: "insert", payload: petData as Record<string, unknown> },
              photo
            );
          } else {
            await enqueue({ table: "pets", operation: "insert", payload: petData as Record<string, unknown> });
          }

          set((s) => ({
            pets: s.pets.map((p) =>
              p.id === tempId ? { ...p, syncing: false } : p
            ),
          }));
          return { error: normalizeError(err) };
        }
      },

      updatePetStatus: async (petId, status) => {
        set((s) => ({
          pets: s.pets.map((p) => (p.id === petId ? { ...p, status, syncing: true } : p)),
        }));

        if (!supabaseConfigured) {
          set((s) => ({
            pets: s.pets.map((p) => (p.id === petId ? { ...p, syncing: false } : p)),
          }));
          return { error: null };
        }

        const { error } = await supabase
          .from("pets")
          .update({ status })
          .eq("id", petId);

        if (error) {
          await enqueue({
            table: "pets",
            operation: "update",
            payload: { id: petId, status },
          });
          set((s) => ({
            pets: s.pets.map((p) => (p.id === petId ? { ...p, syncing: false } : p)),
          }));
          return { error: normalizeError(error) };
        }

        set((s) => ({
          pets: s.pets.map((p) => (p.id === petId ? { ...p, syncing: false } : p)),
        }));
        return { error: null };
      },

      subscribeRealtime: () => {
        if (!supabaseConfigured) return () => {};

        const channel = supabase
          .channel("pets-changes")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "pets" },
            (payload) => {
              const newPet = payload.new as DbPet;
              set((s) => {
                if (s.pets.some((p) => p.id === newPet.id)) return s;
                return { pets: [{ ...newPet } as Pet, ...s.pets] };
              });
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "pets" },
            (payload) => {
              const updated = payload.new as DbPet;
              set((s) => ({
                pets: s.pets.map((p) => (p.id === updated.id ? { ...p, ...updated, syncing: false } : p)),
              }));
            }
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "pets" },
            (payload) => {
              const deleted = payload.old as { id: string };
              set((s) => ({ pets: s.pets.filter((p) => p.id !== deleted.id) }));
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },

      drainOfflineQueue: async () => {
        if (!supabaseConfigured) return;

        const pending = await peekAll();
        for (const item of pending) {
          if (item.table !== "pets") continue;

          try {
            if (item.operation === "insert") {
              let imageUrl: string | null = null;
              if (item.blobKey) {
                const blob = await getBlob(item.blobKey);
                if (blob) {
                  imageUrl = await uploadPetPhoto(blob, item.id);
                }
              }

              const user = (await supabase.auth.getUser()).data.user;
              await supabase.from("pets").insert({
                ...item.payload,
                image_url: imageUrl ?? (item.payload.image_url as string | null),
                reporter_id: user?.id ?? "",
              });
            } else if (item.operation === "update") {
              const { id, ...rest } = item.payload;
              await supabase.from("pets").update(rest).eq("id", id as string);
            }

            await dequeue(item.id);
          } catch {
            break;
          }
        }
      },
    }),
    {
      name: "bud-pets",
      partialize: (state) => ({
        pets: state.pets.filter((p) => !p.syncing),
      }),
    }
  )
);
