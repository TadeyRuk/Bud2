import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ContactType } from "../types/database";

export type ContactTimelineEvent = {
  id: string;
  petId: string;
  contactType: ContactType;
  byUserId: string;
  byUserName: string;
  createdAt: string;
};

type State = {
  entries: ContactTimelineEvent[];
  forPet: (petId: string) => ContactTimelineEvent[];
  recordContact: (e: Omit<ContactTimelineEvent, "id" | "createdAt">) => void;
};

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `ct_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useContactTimelineStore = create<State>()(
  persist(
    (set, get) => ({
      entries: [],

      forPet: (petId) => get().entries.filter((x) => x.petId === petId),

      recordContact: (input) => {
        const row: ContactTimelineEvent = {
          ...input,
          id: newId(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ entries: [row, ...s.entries] }));
      },
    }),
    { name: "bud:contacttimeline:v1" }
  )
);
