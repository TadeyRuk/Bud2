import { create } from "zustand";

export type TabId = "community" | "map" | "report" | "profile";

type UiState = {
  activeTab: TabId;
  selectedPetId: string | null;
  isOffline: boolean;
  setActiveTab: (tab: TabId) => void;
  setSelectedPetId: (id: string | null) => void;
  setOffline: (offline: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeTab: "community",
  selectedPetId: null,
  isOffline: false,
  setActiveTab: (tab) => set({ activeTab: tab, selectedPetId: null }),
  setSelectedPetId: (id) => set({ selectedPetId: id }),
  setOffline: (offline) => set({ isOffline: offline }),
}));
