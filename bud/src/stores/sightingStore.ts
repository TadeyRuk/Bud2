import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SightingMood = "healthy" | "skittish" | "injured" | "with-someone" | "hungry";

/** Client-only sighting record (not the Supabase `Sighting` row shape). */
export type LocalPetSighting = {
  id: string;
  petId: string;
  reporterId: string;
  reporterName: string;
  message: string;
  moods: SightingMood[];
  confidence: 1 | 2 | 3 | 4 | 5;
  when: "just-now" | "within-hour" | "earlier-today";
  lat: number | null;
  lng: number | null;
  locationLabel: string;
  photoDataUrl: string | null;
  createdAt: string;
};

export type LocalPetSightingInput = Omit<LocalPetSighting, "id" | "createdAt">;

type SightingState = {
  sightings: LocalPetSighting[];
  addSighting: (s: LocalPetSightingInput) => LocalPetSighting;
  forPet: (petId: string) => LocalPetSighting[];
  countForPet: (petId: string) => number;
  /** One-time demo seed when store is empty and a pet id exists. */
  seedDemoIfEmpty: (firstPetId: string | undefined, reporterName: string) => void;
};

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `sight_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useSightingStore = create<SightingState>()(
  persist(
    (set, get) => ({
      sightings: [],

      addSighting: (input) => {
        const row: LocalPetSighting = {
          ...input,
          id: newId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ sightings: [row, ...s.sightings] }));
        return row;
      },

      forPet: (petId) => get().sightings.filter((x) => x.petId === petId),

      countForPet: (petId) => get().sightings.filter((x) => x.petId === petId).length,

      seedDemoIfEmpty: (firstPetId, reporterName) => {
        if (!firstPetId || get().sightings.length > 0) return;
        const reporterId = "demo-seed-reporter";
        const base = Date.now();
        const demo: LocalPetSighting[] = [
          {
            id: newId(),
            petId: firstPetId,
            reporterId,
            reporterName,
            message: "Thought I saw them near the corner store.",
            moods: ["skittish"],
            confidence: 3,
            when: "within-hour",
            lat: 14.5995,
            lng: 120.9842,
            locationLabel: "Demo area (seed)",
            photoDataUrl: null,
            createdAt: new Date(base - 3600_000 * 5).toISOString(),
          },
          {
            id: newId(),
            petId: firstPetId,
            reporterId,
            reporterName,
            message: "",
            moods: ["healthy"],
            confidence: 2,
            when: "earlier-today",
            lat: 14.6001,
            lng: 120.985,
            locationLabel: "Demo area (seed 2)",
            photoDataUrl: null,
            createdAt: new Date(base - 3600_000 * 12).toISOString(),
          },
          {
            id: newId(),
            petId: firstPetId,
            reporterId,
            reporterName,
            message: "Reported, no details shared.",
            moods: [],
            confidence: 1,
            when: "just-now",
            lat: null,
            lng: null,
            locationLabel: "",
            photoDataUrl: null,
            createdAt: new Date(base - 3600_000 * 20).toISOString(),
          },
        ];
        set({ sightings: demo });
      },
    }),
    { name: "bud:sightings:v1" }
  )
);
