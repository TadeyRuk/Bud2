import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { pets as demoPets, type Pet } from "../data/pets";

type NewLostPet = {
  name: string;
  type: Pet["type"];
  location: string;
  description: string;
  image?: string;
};

interface PetsContextType {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  refreshPets: () => Promise<void>;
  submitReport: (report: {
    pet_id: string;
    reporter_name?: string;
    reporter_contact?: string;
    message: string;
    lat?: number;
    lng?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  submitLostPet: (pet: NewLostPet) => Promise<{ success: boolean; error?: string }>;
}

const PetsContext = createContext<PetsContextType | undefined>(undefined);

export function PetsProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        setPets(demoPets);
        setError(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Map snake_case from DB to camelCase for TS
      const mappedPets: Pet[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        breed: p.breed,
        color: p.color,
        furColor: p.fur_color, // Mapping fur_color -> furColor
        gender: p.gender,
        status: p.status,
        type: p.type,
        location: p.location,
        date: p.date,
        image: p.image,
        description: p.description,
        pin: p.pin,
        lat: p.lat,
        lng: p.lng,
        ownerName: p.owner_name,
        ownerContact: p.owner_contact,
      }));

      setPets(mappedPets);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching pets:", err);
      setPets(demoPets);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const submitReport = async (report: {
    pet_id: string;
    reporter_name?: string;
    reporter_contact?: string;
    message: string;
    lat?: number;
    lng?: number;
  }) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        return { success: false, error: "Supabase is not configured." };
      }

      const { error: reportError } = await supabase
        .from("reports")
        .insert([report]);

      if (reportError) throw reportError;
      return { success: true };
    } catch (err: any) {
      console.error("Error submitting report:", err);
      return { success: false, error: err.message };
    }
  };

  const submitLostPet = async (pet: NewLostPet) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        return { success: false, error: "Supabase is not configured." };
      }

      const { error: petError } = await supabase.from("pets").insert([
        {
          name: pet.name || "Unknown pet",
          type: pet.type,
          location: pet.location,
          description: pet.description,
          image:
            pet.image ||
            "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
          color: "Unknown",
          fur_color: "Unknown",
          gender: "Unknown",
          status: "LOST",
          date: "Just now",
          pin: { topPct: 50, leftPct: 50 },
        },
      ]);

      if (petError) throw petError;
      await fetchPets();
      return { success: true };
    } catch (err: any) {
      console.error("Error submitting lost pet:", err);
      return { success: false, error: err.message };
    }
  };

  return (
    <PetsContext.Provider
      value={{ pets, loading, error, refreshPets: fetchPets, submitReport, submitLostPet }}
    >
      {children}
    </PetsContext.Provider>
  );
}

export function usePets() {
  const context = useContext(PetsContext);
  if (context === undefined) {
    throw new Error("usePets must be used within a PetsProvider");
  }
  return context;
}
