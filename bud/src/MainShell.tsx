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
import { usePetStore, type Pet } from "./stores/petStore";
import { useAuthStore } from "./stores/authStore";
import { useNotificationStore } from "./stores/notificationStore";
import { useUiStore } from "./stores/uiStore";
import { useNetworkStatus } from "./lib/networkStatus";

function AppHeader({
  activeTab,
  communityScrollRef,
  onNotifications,
}: {
  activeTab: TabId;
  communityScrollRef: RefObject<HTMLDivElement | null>;
  onNotifications: () => void;
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
    <header className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 bg-bud-bg/95 backdrop-blur-sm z-30">
      <button
        type="button"
        onClick={scrollCommunityTop}
        className="flex items-center gap-2 rounded-xl py-1 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-bud-primary/40 active:opacity-90"
        aria-label={activeTab === "community" ? "Scroll community to top" : "Bud"}
      >
        <span className="text-bud-primary" aria-hidden>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-1.5 0-2.8.4-3.9 1.1A4.5 4.5 0 005 3.5C3.5 3.5 2 5 2 7v1c0 3.5 3 7 4 8s2.5 2 6 2 5-1 6-2 4-4.5 4-8V7c0-2-1.5-3.5-3-3.5-.6 0-1.2.2-1.7.6A6.3 6.3 0 0012 2zm-1 5.5c.8 0 1.5.7 1.5 1.5S11.8 10.5 11 10.5 9.5 9.8 9.5 9s.7-1.5 1.5-1.5zm3 0c.8 0 1.5.7 1.5 1.5S15.8 10.5 15 10.5 13.5 9.8 13.5 9s.7-1.5 1.5-1.5z" />
          </svg>
        </span>
        <span className="font-headline text-2xl font-extrabold text-bud-text tracking-tight">
          Bud
        </span>
      </button>
      <button
        type="button"
        aria-label="Notifications"
        onClick={onNotifications}
        className="relative p-2 rounded-full text-bud-primary hover:bg-bud-surface-low transition-colors"
      >
        <svg
          className="w-6 h-6"
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
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}

/** Full tabbed app from team `main` (Leaflet map, stores, auth). Wrapped by `PhoneFrame` + routes in `App.tsx`. */
export function MainShell() {
  const communityScrollRef = useRef<HTMLDivElement | null>(null);
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const selectedPetId = useUiStore((s) => s.selectedPetId);
  const setSelectedPetId = useUiStore((s) => s.setSelectedPetId);

  const pets = usePetStore((s) => s.pets);
  const subscribeRealtime = usePetStore((s) => s.subscribeRealtime);
  const drainPetQueue = usePetStore((s) => s.drainOfflineQueue);

  const user = useAuthStore((s) => s.user);
  const initialize = useAuthStore((s) => s.initialize);

  const subscribeNotifications = useNotificationStore((s) => s.subscribeRealtime);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const startPolling = useNotificationStore((s) => s.startPolling);
  const stopPolling = useNotificationStore((s) => s.stopPolling);
  const drainNotifQueue = useNotificationStore((s) => s.drainOfflineQueue);

  const [showAuth, setShowAuth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isOnline = useNetworkStatus();

  const selectedPet = selectedPetId
    ? pets.find((p) => p.id === selectedPetId)
    : undefined;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const unsub = subscribeRealtime();
    return unsub;
  }, [subscribeRealtime]);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    const unsubNotif = subscribeNotifications(user.id);
    startPolling(user.id);

    return () => {
      unsubNotif();
      stopPolling();
    };
  }, [user, fetchNotifications, subscribeNotifications, startPolling, stopPolling]);

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

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full min-h-0 relative bg-bud-bg">
        <OfflineBanner />

        {!selectedPet && !showAuth && !showNotifications && (
          <AppHeader
            activeTab={activeTab}
            communityScrollRef={communityScrollRef}
            onNotifications={() => setShowNotifications(true)}
          />
        )}

        <div className="flex-1 min-h-0 flex flex-col relative transition-opacity duration-200 ease-out">
          {activeTab === "community" && (
            <div
              ref={communityScrollRef}
              className="flex-1 min-h-0 overflow-y-auto pb-28 bud-tab-fade"
            >
              <CommunityBoard onSelectPet={openPet} onRequestAuth={requestAuth} />
            </div>
          )}

          {activeTab === "map" && (
            <div className="flex-1 min-h-0 flex flex-col pb-24 bud-tab-fade">
              <MapView onSelectPet={openPet} />
            </div>
          )}

          {activeTab === "report" && (
            <div className="flex-1 min-h-0 overflow-y-auto bud-tab-fade">
              <ReportLostPet onRequestAuth={requestAuth} />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="flex-1 min-h-0 overflow-y-auto bud-tab-fade">
              <Profile onRequestAuth={requestAuth} onSelectPet={openPet} />
            </div>
          )}
        </div>

        {!selectedPet && !showAuth && !showNotifications && (
          <BottomNav active={activeTab} onChange={onTabChange} />
        )}

        {selectedPet && (
          <PetDetail pet={selectedPet} onBack={closePet} onRequestAuth={requestAuth} />
        )}

        {showAuth && <AuthScreen onClose={() => setShowAuth(false)} />}

        {showNotifications && (
          <Notifications onClose={() => setShowNotifications(false)} />
        )}
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
    </ErrorBoundary>
  );
}
