import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Toaster } from "react-hot-toast";
import { BottomNav, type TabId } from "./components/BottomNav";
import { OfflineBanner } from "./components/OfflineBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CommunityBoard } from "./screens/CommunityBoard";
import { MapView } from "./screens/MapView";
import { ReportLostPet } from "./screens/ReportLostPet";
import { Profile } from "./screens/Profile";
import { PetDetail } from "./screens/PetDetail";
import { AuthScreen } from "./screens/Auth";
import { Notifications } from "./screens/Notifications";
import { SightingSheet } from "./components/SightingSheet/SightingSheet";
import { usePetStore, type Pet } from "./stores/petStore";
import { useAuthStore } from "./stores/authStore";
import { useNotificationStore } from "./stores/notificationStore";
import { useUiStore } from "./stores/uiStore";
import { useSightingStore } from "./stores/sightingStore";
import { useStatusHistoryStore } from "./stores/statusHistoryStore";
import { useNetworkStatus } from "./lib/networkStatus";
import { getOnboardingProfile } from "./lib/onboardingProfile";
import { showError, showSuccess } from "./lib/api";
import { supabase, supabaseConfigured } from "./lib/supabase";
import { BudLogoMark } from "./components/BudLogoMark";
import { LocationProvider } from "./context/LocationContext";
import { BellBadge } from "./components/BellBadge";
import { FilterDrawer } from "./components/FilterDrawer";
import { ReunionOverlay } from "./components/ReunionOverlay";

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

  const pets = usePetStore((s) => s.pets);
  const fetchPets = usePetStore((s) => s.fetchPets);
  const subscribeRealtime = usePetStore((s) => s.subscribeRealtime);
  const drainPetQueue = usePetStore((s) => s.drainOfflineQueue);
  const seedDemoIfEmpty = useSightingStore((s) => s.seedDemoIfEmpty);
  const seedStatusHistoryIfEmpty = useStatusHistoryStore((s) => s.seedFromDemoIfEmpty);

  const user = useAuthStore((s) => s.user);
  const initialize = useAuthStore((s) => s.initialize);

  const subscribeNotifications = useNotificationStore((s) => s.subscribeRealtime);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const startPolling = useNotificationStore((s) => s.startPolling);
  const stopPolling = useNotificationStore((s) => s.stopPolling);
  const drainNotifQueue = useNotificationStore((s) => s.drainOfflineQueue);

  const [showAuth, setShowAuth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [realtimeReconnectKey, setRealtimeReconnectKey] = useState(0);

  const isOnline = useNetworkStatus();

  const selectedPet = selectedPetId ? pets.find((p) => p.id === selectedPetId) : undefined;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const unsub = subscribeRealtime();
    return unsub;
  }, [subscribeRealtime, realtimeReconnectKey]);

  useEffect(() => {
    fetchPets(true);
  }, [fetchPets]);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    const unsubNotif = subscribeNotifications(user.id);
    startPolling(user.id);

    return () => {
      unsubNotif();
      stopPolling();
    };
  }, [user, fetchNotifications, subscribeNotifications, startPolling, stopPolling, realtimeReconnectKey]);

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

  const requestAuth = useCallback(() => {
    setShowAuth(true);
  }, []);

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
      await supabase.auth.refreshSession();
      await drainPetQueue();
      await fetchPets(true);

      if (user) {
        await drainNotifQueue();
        await fetchNotifications();
      }

      setRealtimeReconnectKey((key) => key + 1);
      showSuccess("Synced with the database.");
    } catch (err) {
      showError(err);
    } finally {
      setSyncing(false);
    }
  }, [drainPetQueue, drainNotifQueue, fetchNotifications, fetchPets, isOnline, syncing, user]);

  return (
    <ErrorBoundary>
      <LocationProvider>
      <div className="relative flex h-full min-h-0 flex-1 flex-col">
        <OfflineBanner />

        <div className="relative flex min-h-0 flex-1 flex-col transition-opacity duration-200 ease-out">
          {activeTab === "community" ? (
            <div
              ref={communityScrollRef}
              className="bud-tab-fade flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[5.25rem] [scroll-padding-bottom:5.5rem] [scroll-padding-top:0.5rem]"
            >
              {!selectedPet && !showAuth && !showNotifications && (
                <AppHeader
                  activeTab={activeTab}
                  communityScrollRef={communityScrollRef}
                  onNotifications={() => setShowNotifications(true)}
                  onSync={syncWithDatabase}
                  syncing={syncing}
                />
              )}
              <CommunityBoard listScrollRef={communityScrollRef} onSelectPet={openPet} onRequestAuth={requestAuth} />
            </div>
          ) : null}

          {!selectedPet && !showAuth && !showNotifications && activeTab !== "community" ? (
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
                  <MapView onSelectPet={openPet} />
                </div>
              )}

              {activeTab === "report" && (
                <div className="bud-tab-fade flex min-h-0 flex-1 overflow-y-auto pb-[5.25rem]">
                  <ReportLostPet onRequestAuth={requestAuth} />
                </div>
              )}

              {activeTab === "profile" && (
                <div className="bud-tab-fade flex min-h-0 flex-1 overflow-y-auto pb-[5.25rem]">
                  <Profile onRequestAuth={requestAuth} onSelectPet={openPet} />
                </div>
              )}
            </div>
          ) : null}
        </div>

        {!selectedPet && !showAuth && !showNotifications && (
          <BottomNav active={activeTab} onChange={onTabChange} />
        )}

        {selectedPet && <PetDetail pet={selectedPet} onBack={closePet} onRequestAuth={requestAuth} />}

        {showAuth && <AuthScreen variant="overlay" onClose={() => setShowAuth(false)} />}

        {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}

        <SightingSheet />

        <FilterDrawer />
        <ReunionOverlay />
      </div>

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
