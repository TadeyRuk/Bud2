import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PetStatus } from "../types/database";

export type FilterStateShape = {
  species: Array<"dog" | "cat" | "other">;
  statuses: PetStatus[];
  maxDistanceKm: 0 | 0.5 | 1 | 2 | 3 | 5;
  reportedWithin: "24h" | "7d" | "30d" | "any";
  hasPhoto: boolean;
  verifiedOnly: boolean;
};

export const defaultFilters: FilterStateShape = {
  species: [],
  statuses: [],
  maxDistanceKm: 0,
  reportedWithin: "any",
  hasPhoto: false,
  verifiedOnly: false,
};

type FilterStore = FilterStateShape & {
  setKey: <K extends keyof FilterStateShape>(key: K, value: FilterStateShape[K]) => void;
  toggleInArray: (key: "species" | "statuses", value: string) => void;
  reset: () => void;
  isActive: () => boolean;
  activeCount: () => number;
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...defaultFilters,

      setKey: (key, value) => set({ [key]: value } as Partial<FilterStateShape>),

      toggleInArray: (key, value) =>
        set((s) => {
          const arr = s[key] as string[];
          const on = arr.includes(value);
          const next = on ? arr.filter((x) => x !== value) : [...arr, value];
          return { [key]: next } as Partial<FilterStateShape>;
        }),

      reset: () => set({ ...defaultFilters }),

      isActive: () => {
        const s = get();
        return (
          s.species.length > 0 ||
          s.statuses.length > 0 ||
          s.maxDistanceKm > 0 ||
          s.reportedWithin !== "any" ||
          s.hasPhoto ||
          s.verifiedOnly
        );
      },

      activeCount: () => {
        const s = get();
        let n = 0;
        if (s.species.length) n += s.species.length;
        if (s.statuses.length) n += s.statuses.length;
        if (s.maxDistanceKm > 0) n += 1;
        if (s.reportedWithin !== "any") n += 1;
        if (s.hasPhoto) n += 1;
        if (s.verifiedOnly) n += 1;
        return n;
      },
    }),
    { name: "bud:filters:v1" }
  )
);
