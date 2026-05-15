import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TabId = "community" | "map" | "report" | "profile";

export type NearbyFocusRadius = 500 | 1000 | 2000;

const DEFAULT_USER_LL: [number, number] = [14.5995, 120.9842];

type UiState = {
  activeTab: TabId;
  selectedPetId: string | null;
  isOffline: boolean;
  sightingSheetOpen: boolean;
  sightingSheetPetId: string | null;
  sightingSheetOriginRect: DOMRect | null;
  sightingSheetFocusEl: HTMLElement | null;
  sightingPulsePetId: string | null;
  /** Last known device location (fallback for filters when GPS unavailable); updated by `LocationProvider`. */
  userLatLng: [number, number];
  nearbyMode: boolean;
  nearbyFocusRadius: NearbyFocusRadius;
  /** Sub-plan 05 */
  filterDrawerOpen: boolean;
  /** Sub-plan 06 */
  quietHours: boolean;
  setActiveTab: (tab: TabId) => void;
  setSelectedPetId: (id: string | null) => void;
  setOffline: (offline: boolean) => void;
  openSightingSheet: (petId: string, originRect: DOMRect, focusReturn?: HTMLElement | null) => void;
  closeSightingSheet: () => void;
  setSightingPulsePetId: (id: string | null) => void;
  setUserLatLng: (ll: [number, number]) => void;
  setNearbyMode: (v: boolean) => void;
  setNearbyFocusRadius: (r: NearbyFocusRadius) => void;
  setFilterDrawerOpen: (v: boolean) => void;
  setQuietHours: (v: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeTab: "community",
      selectedPetId: null,
      isOffline: false,
      sightingSheetOpen: false,
      sightingSheetPetId: null,
      sightingSheetOriginRect: null,
      sightingSheetFocusEl: null,
      sightingPulsePetId: null,
      userLatLng: DEFAULT_USER_LL,
      nearbyMode: false,
      nearbyFocusRadius: 500,
      filterDrawerOpen: false,
      quietHours: false,

      setActiveTab: (tab) => set({ activeTab: tab, selectedPetId: null }),
      setSelectedPetId: (id) => set({ selectedPetId: id }),
      setOffline: (offline) => set({ isOffline: offline }),
      openSightingSheet: (petId, originRect, focusReturn = null) =>
        set({
          sightingSheetOpen: true,
          sightingSheetPetId: petId,
          sightingSheetOriginRect: originRect,
          sightingSheetFocusEl: focusReturn,
        }),
      closeSightingSheet: () =>
        set({
          sightingSheetOpen: false,
          sightingSheetPetId: null,
          sightingSheetOriginRect: null,
          sightingSheetFocusEl: null,
        }),
      setSightingPulsePetId: (id) => set({ sightingPulsePetId: id }),
      setUserLatLng: (ll) => set({ userLatLng: ll }),
      setNearbyMode: (v) => set({ nearbyMode: v }),
      setNearbyFocusRadius: (r) => set({ nearbyFocusRadius: r }),
      setFilterDrawerOpen: (v) => set({ filterDrawerOpen: v }),
      setQuietHours: (v) => set({ quietHours: v }),
    }),
    {
      name: "bud:ui:v1",
      partialize: (s) => ({
        userLatLng: s.userLatLng,
        nearbyMode: s.nearbyMode,
        nearbyFocusRadius: s.nearbyFocusRadius,
        quietHours: s.quietHours,
      }),
    }
  )
);
