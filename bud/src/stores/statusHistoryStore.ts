import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PetStatus } from "../types/database";
import { DEMO_PETS, DEMO_REPORTER_ID } from "../data/pets";

export type StatusChange = {
  id: string;
  petId: string;
  from: PetStatus | null;
  to: PetStatus;
  byUserId: string;
  byUserName: string;
  createdAt: string;
};

type StatusHistoryState = {
  changes: StatusChange[];
  forPet: (petId: string) => StatusChange[];
  recordChange: (c: Omit<StatusChange, "id" | "createdAt">) => void;
  /** One-time demo rows aligned with DEMO_PETS initial status */
  seedFromDemoIfEmpty: () => void;
};

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `st_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useStatusHistoryStore = create<StatusHistoryState>()(
  persist(
    (set, get) => ({
      changes: [],

      forPet: (petId) => get().changes.filter((c) => c.petId === petId),

      recordChange: (input) => {
        const row: StatusChange = {
          ...input,
          id: newId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ changes: [row, ...s.changes] }));
      },

      seedFromDemoIfEmpty: () => {
        if (get().changes.length > 0) return;
        const now = Date.now();
        const seeded: StatusChange[] = DEMO_PETS.map((p, i) => ({
          id: newId(),
          petId: p.id,
          from: null,
          to: p.status as PetStatus,
          byUserId: DEMO_REPORTER_ID,
          byUserName: "Community",
          createdAt: new Date(now - (i + 1) * 86_400_000 * 2).toISOString(),
        }));
        set({ changes: seeded });
      },
    }),
    { name: "bud:statushistory:v1" }
  )
);
