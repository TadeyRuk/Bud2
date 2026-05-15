import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "react-hot-toast";
import { BottomNav, type TabId } from "./components/BottomNav";
import { OfflineBanner } from "./components/OfflineBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { OnboardingModal } from "./components/OnboardingModal";
import { CommunityBoard } from "./screens/CommunityBoard";
import { MapView } from "./screens/MapView";
import { ReportLostPet } from "./screens/ReportLostPet";
import { Profile } from "./screens/Profile";
import { PetDetail } from "./screens/PetDetail";
import { Notifications } from "./screens/Notifications";
import { AuthScreen } from "./screens/AuthScreen";
import { SightingSheet } from "./components/SightingSheet/SightingSheet";
import { usePetStore, type Pet } from "./stores/petStore";
import { useNotificationStore } from "./stores/notificationStore";
import { useUiStore } from "./stores/uiStore";
import { useAuthStore } from "./stores/authStore";
import { useSightingStore } from "./stores/sightingStore";
import { useStatusHistoryStore } from "./stores/statusHistoryStore";
import { useNetworkStatus } from "./lib/networkStatus";
import { getOnboardingProfile } from "./lib/onboardingProfile";
import { BudLogoMark } from "./components/BudLogoMark";
import { LocationProvider } from "./context/LocationContext";
import { BellBadge } from "./components/BellBadge";
import { FilterDrawer } from "./components/FilterDrawer";
import { ReunionOverlay } from "./components/ReunionOverlay";

function AppHeader({
  activeTab,
  communityScrollRef,
  onNotifications,
}: {
  activeTab: TabId;
  communityScrollRef: RefObject<HTMLDivElement | null>;
  onNotifications: () => void;
}) {
  const scrollCommunityTop = useCallback(() => {
    if (activeTab !== "community") return;
    const el = communityScrollRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [activeTab, communityScrollRef]);

  return (
    <header className="shrink-0 z-30 flex items-center justify-between bg-transparent px-4 pb-3 pt-3">
      <button
        type="button"
        onClick={scrollCommunityTop}
        className="-ml-0.5 rounded-lg py-1 text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-bud-primary/40 active:opacity-85"
        aria-label={activeTab === "community" ? "Scroll community to top" : "Bud"}
      >
        <BudLogoMark variant="header" />
      </button>
      <div className="flex items-center gap-2">
        <BellBadge onClick={onNotifications} />
      </div>
    </header>
  );
}

/** Full tabbed app — wrapped by `PhoneFrame` + routes in `App.tsx`. */
export function MainShell() {
  const communityScrollRef = useRef<HTMLDivElement | null>(null);
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const selectedPetId = useUiStore((s) => s.selectedPetId);
  const setSelectedPetId = useUiStore((s) => s.setSelectedPetId);

  const user = useAuthStore((s) => s.user);

  const pets = usePetStore((s) => s.pets);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const subscribeRealtime = usePetStore((s) => s.subscribeRealtime);
  const drainPetQueue = usePetStore((s) => s.drainOfflineQueue);
  const seedDemoIfEmpty = useSightingStore((s) => s.seedDemoIfEmpty);
  const seedStatusHistoryIfEmpty = useStatusHistoryStore((s) => s.seedFromDemoIfEmpty);

  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const drainNotifQueue = useNotificationStore((s) => s.drainOfflineQueue);
  const subscribeNotifRealtime = useNotificationStore((s) => s.subscribeRealtime);
  const startPolling = useNotificationStore((s) => s.startPolling);
  const stopPolling = useNotificationStore((s) => s.stopPolling);

  const [showOnboarding, setShowOnboarding] = useState(() => !getOnboardingProfile());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const isOnline = useNetworkStatus();

  const selectedPet = selectedPetId ? pets.find((p) => p.id === selectedPetId) : undefined;
  const overlayOpen = showOnboarding || showNotifications || showAuth;

  const requestAuth = useCallback(() => setShowAuth(true), []);

  const [portalRootEl, setPortalRootEl] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalRootEl(document.getElementById("bud-phone-overlay-portal"));
  }, []);

  useEffect(() => {
    const unsub = subscribeRealtime();
    return unsub;
  }, [subscribeRealtime]);

  useEffect(() => {
    fetchPets(true);
  }, [fetchPets]);

  useEffect(() => {
    if (!user) return;

    void fetchNotifications();
    const unsubNotif = subscribeNotifRealtime(user.id);
    startPolling(user.id);

    return () => {
      unsubNotif();
      stopPolling();
    };
  }, [user, fetchNotifications, subscribeNotifRealtime, startPolling, stopPolling]);

  useEffect(() => {
    const name = getOnboardingProfile()?.name?.trim() ?? "Neighbor";
    seedDemoIfEmpty(pets[0]?.id, name);
  }, [pets, seedDemoIfEmpty]);

  useEffect(() => {
    seedStatusHistoryIfEmpty();
  }, [seedStatusHistoryIfEmpty]);

  useEffect(() => {
    if (isOnline) {
      drainPetQueue();
      drainNotifQueue();
    }
  }, [isOnline, drainPetQueue, drainNotifQueue]);

  const openPet = useCallback(
    (pet: Pet) => {
      setSelectedPetId(pet.id);
    },
    [setSelectedPetId]
  );

  const closePet = useCallback(() => {
    setSelectedPetId(null);
  }, [setSelectedPetId]);

  const onTabChange = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
      setSelectedPetId(null);
    },
    [setActiveTab, setSelectedPetId]
  );

  return (
    <ErrorBoundary>
      <LocationProvider>
        <div className={`relative flex h-full min-h-0 flex-1 flex-col${selectedPet ? " overflow-hidden" : ""}`}>
          <OfflineBanner />

          <div className="relative flex min-h-0 flex-1 flex-col transition-opacity duration-200 ease-out">
            {activeTab === "community" ? (
              <div
                ref={communityScrollRef}
                className="bud-tab-fade flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[5.25rem] [scroll-padding-bottom:5.5rem] [scroll-padding-top:0.5rem]"
              >
                {!selectedPet && !overlayOpen && (
                  <AppHeader
                    activeTab={activeTab}
                    communityScrollRef={communityScrollRef}
                    onNotifications={() => setShowNotifications(true)}
                  />
                )}
                <CommunityBoard
                  listScrollRef={communityScrollRef}
                  onSelectPet={openPet}
                  onRequestAuth={requestAuth}
                />
              </div>
            ) : null}

            {!selectedPet && !overlayOpen && activeTab !== "community" ? (
              <AppHeader
                activeTab={activeTab}
                communityScrollRef={communityScrollRef}
                onNotifications={() => setShowNotifications(true)}
              />
            ) : null}

            {activeTab !== "community" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                {activeTab === "map" && (
                  <div className="bud-tab-fade flex min-h-0 flex-1 flex-col pb-[5.25rem]">
                    {!selectedPet ? (
                      <MapView onSelectPet={openPet} />
                    ) : (
                      <div className="min-h-0 w-full flex-1 bg-bud-bg" aria-hidden />
                    )}
                  </div>
                )}

                {activeTab === "report" && (
                  <div className="bud-tab-fade flex min-h-0 flex-1 overflow-y-auto pb-[5.25rem]">
                    <ReportLostPet />
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="bud-tab-fade flex min-h-0 flex-1 overflow-y-auto pb-[5.25rem]">
                    <Profile onSelectPet={openPet} onEditSetup={() => setShowOnboarding(true)} />
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {!selectedPet && !overlayOpen && <BottomNav active={activeTab} onChange={onTabChange} />}
        </div>

        {selectedPet &&
          portalRootEl &&
          createPortal(
            <PetDetail pet={selectedPet} onBack={closePet} onRequestAuth={requestAuth} />,
            portalRootEl
          )}
        {showNotifications &&
          portalRootEl &&
          createPortal(<Notifications onClose={() => setShowNotifications(false)} />, portalRootEl)}
        {showAuth &&
          portalRootEl &&
          createPortal(<AuthScreen onClose={() => setShowAuth(false)} />, portalRootEl)}
        {showOnboarding &&
          portalRootEl &&
          createPortal(
            <OnboardingModal
              onComplete={() => setShowOnboarding(false)}
              onSkip={() => setShowOnboarding(false)}
            />,
            portalRootEl
          )}

        <SightingSheet />
        <FilterDrawer />
        <ReunionOverlay />

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "'Work Sans', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
              padding: "12px 16px",
            },
          }}
        />
      </LocationProvider>
    </ErrorBoundary>
  );
}
