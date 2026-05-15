import { create } from "zustand";

type ReunionState = {
  activePetId: string | null;
  /** Minimal orchestration — full animation lives in overlay */
  phase: "idle" | "celebrate";
  start: (petId: string) => void;
  skipToShare: () => void;
  close: () => void;
};

export const useReunionStore = create<ReunionState>((set) => ({
  activePetId: null,
  phase: "idle",

  start: (petId) => set({ activePetId: petId, phase: "celebrate" }),

  skipToShare: () => set({ phase: "celebrate" }),

  close: () => set({ activePetId: null, phase: "idle" }),
}));
