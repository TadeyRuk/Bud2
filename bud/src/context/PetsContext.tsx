import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Pet } from '../data/pets';

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
}

const PetsContext = createContext<PetsContextType | undefined>(undefined);

export function PetsProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

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
      console.error('Error fetching pets:', err);
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
      const { error: reportError } = await supabase
        .from('reports')
        .insert([report]);

      if (reportError) throw reportError;
      return { success: true };
    } catch (err: any) {
      console.error('Error submitting report:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <PetsContext.Provider value={{ pets, loading, error, refreshPets: fetchPets, submitReport }}>
      {children}
    </PetsContext.Provider>
  );
}

export function usePets() {
  const context = useContext(PetsContext);
  if (context === undefined) {
    throw new Error('usePets must be used within a PetsProvider');
  }
  return context;
}
