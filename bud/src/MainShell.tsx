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
import { usePetStore, type Pet } from "./stores/petStore";
import { useNotificationStore } from "./stores/notificationStore";
import { useUiStore } from "./stores/uiStore";
import { useNetworkStatus } from "./lib/networkStatus";
import { showError, showSuccess } from "./lib/api";
import { supabaseConfigured } from "./lib/supabase";
import { getOnboardingProfile } from "./lib/onboardingProfile";
import { BudLogoMark } from "./components/BudLogoMark";
import { LocationProvider } from "./context/LocationContext";

function AppHeader({
  activeTab,
  communityScrollRef,
  onNotifications,
  onSync,
  syncing,
}: {
  activeTab: TabId;
  communityScrollRef: RefObject<HTMLDivElement | null>;
  onNotifications: () => void;
  onSync: () => void;
  syncing: boolean;
}) {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

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
        <button
          type="button"
          aria-label="Sync with database"
          onClick={onSync}
          disabled={syncing}
          className="rounded-full border border-white/45 bg-white/40 p-2 text-bud-primary shadow-sm backdrop-blur-md transition-colors hover:bg-white/55 disabled:cursor-wait disabled:opacity-70"
        >
          <svg
            className={`h-6 w-6 ${syncing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992V4.356M20.37 8.91A8.25 8.25 0 005.64 5.64M7.977 14.652H2.985v4.992M3.63 15.09a8.25 8.25 0 0014.73 3.27"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Notifications"
          onClick={onNotifications}
          className="relative rounded-full border border-white/45 bg-white/40 p-2 text-bud-primary shadow-sm backdrop-blur-md transition-colors hover:bg-white/55"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
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

  const pets = usePetStore((s) => s.pets);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const subscribeRealtime = usePetStore((s) => s.subscribeRealtime);
  const drainPetQueue = usePetStore((s) => s.drainOfflineQueue);

  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const drainNotifQueue = useNotificationStore((s) => s.drainOfflineQueue);

  const [showOnboarding, setShowOnboarding] = useState(() => !getOnboardingProfile());
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [realtimeReconnectKey, setRealtimeReconnectKey] = useState(0);

  const isOnline = useNetworkStatus();

  const selectedPet = selectedPetId ? pets.find((p) => p.id === selectedPetId) : undefined;
  const overlayOpen = showOnboarding || showNotifications;

  const [portalRootEl, setPortalRootEl] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalRootEl(document.getElementById("bud-phone-overlay-portal"));
  }, []);

  useEffect(() => {
    const unsub = subscribeRealtime();
    return unsub;
  }, [subscribeRealtime, realtimeReconnectKey]);

  useEffect(() => {
    fetchPets(true);
  }, [fetchPets]);

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

  const syncWithDatabase = useCallback(async () => {
    if (syncing) return;

    if (!supabaseConfigured) {
      showError("Database is not configured. Add Supabase environment variables to sync online.");
      return;
    }

    if (!isOnline) {
      showError("You are offline. Reconnect to sync with the database.");
      return;
    }

    setSyncing(true);
    try {
      await drainPetQueue();
      await fetchPets(true);
      await drainNotifQueue();
      await fetchNotifications();

      setRealtimeReconnectKey((key) => key + 1);
      showSuccess("Synced with the database.");
    } catch (err) {
      showError(err);
    } finally {
      setSyncing(false);
    }
  }, [drainPetQueue, drainNotifQueue, fetchNotifications, fetchPets, isOnline, syncing]);

  return (
    <ErrorBoundary>
      <LocationProvider>
        <div className={`relative flex h-full min-h-0 flex-1 flex-col${selectedPet ? " overflow-hidden" : ""}`}>
          <OfflineBanner />

          <div className="relative flex min-h-0 flex-1 flex-col transition-opacity duration-200 ease-out">
            {activeTab === "community" ? (
              <div
                ref={communityScrollRef}
                className="bud-tab-fade flex min-h-0 flex-1 flex-col overflow-y-auto pb-[5.25rem]"
              >
                {!selectedPet && !overlayOpen && (
                  <AppHeader
                    activeTab={activeTab}
                    communityScrollRef={communityScrollRef}
                    onNotifications={() => setShowNotifications(true)}
                    onSync={syncWithDatabase}
                    syncing={syncing}
                  />
                )}
                <CommunityBoard onSelectPet={openPet} />
              </div>
            ) : null}

            {!selectedPet && !overlayOpen && activeTab !== "community" ? (
              <AppHeader
                activeTab={activeTab}
                communityScrollRef={communityScrollRef}
                onNotifications={() => setShowNotifications(true)}
                onSync={syncWithDatabase}
                syncing={syncing}
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

          {!selectedPet && !overlayOpen && (
            <BottomNav active={activeTab} onChange={onTabChange} />
          )}
        </div>

        {selectedPet &&
          portalRootEl &&
          createPortal(<PetDetail pet={selectedPet} onBack={closePet} />, portalRootEl)}
        {showNotifications &&
          portalRootEl &&
          createPortal(<Notifications onClose={() => setShowNotifications(false)} />, portalRootEl)}
        {showOnboarding &&
          portalRootEl &&
          createPortal(
            <OnboardingModal
              onComplete={() => setShowOnboarding(false)}
              onSkip={() => setShowOnboarding(false)}
            />,
            portalRootEl
          )}

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
