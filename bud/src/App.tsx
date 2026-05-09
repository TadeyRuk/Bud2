import { useCallback, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PhoneFrame } from "./components/PhoneFrame";
import { BottomNav, type TabId } from "./components/BottomNav";
import { CommunityBoard } from "./screens/CommunityBoard";
import { MapView } from "./screens/MapView";
import { PetDetail } from "./screens/PetDetail";
import { ReportLostPet } from "./screens/ReportLostPet";
import { Profile } from "./screens/Profile";
import type { Pet } from "./data/pets";
import { getPetById } from "./data/pets";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SplashPage } from "./pages/SplashPage";

function AppHeader() {
  return (
    <header className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 bg-bud-bg/95 backdrop-blur-sm z-30">
      <div className="flex items-center gap-2">
        <span className="text-bud-primary" aria-hidden>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c-1.5 0-2.8.4-3.9 1.1A4.5 4.5 0 005 3.5C3.5 3.5 2 5 2 7v1c0 3.5 3 7 4 8s2.5 2 6 2 5-1 6-2 4-4.5 4-8V7c0-2-1.5-3.5-3-3.5-.6 0-1.2.2-1.7.6A6.3 6.3 0 0012 2zm-1 5.5c.8 0 1.5.7 1.5 1.5S11.8 10.5 11 10.5 9.5 9.8 9.5 9s.7-1.5 1.5-1.5zm3 0c.8 0 1.5.7 1.5 1.5S15.8 10.5 15 10.5 13.5 9.8 13.5 9s.7-1.5 1.5-1.5z" />
          </svg>
        </span>
        <span className="font-headline text-2xl font-extrabold text-bud-text tracking-tight">
          Bud
        </span>
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="p-2 rounded-full text-bud-primary hover:bg-bud-surface-low transition-colors"
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
      </button>
    </header>
  );
}

function HomeApp() {
  const [activeTab, setActiveTab] = useState<TabId>("community");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const selectedPet = selectedPetId ? getPetById(selectedPetId) : undefined;

  const openPet = useCallback((pet: Pet) => {
    setSelectedPetId(pet.id);
  }, []);

  const closePet = useCallback(() => {
    setSelectedPetId(null);
  }, []);

  const onHaveInfo = useCallback((pet: Pet) => {
    window.alert(
      `Thanks — we'll connect you about ${pet.name}. (Demo: no message was sent.)`
    );
  }, []);

  const onTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setSelectedPetId(null);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0 relative bg-bud-bg">
      {!selectedPet && <AppHeader />}

      <div className="flex-1 min-h-0 flex flex-col relative transition-opacity duration-200 ease-out">
        {activeTab === "community" && (
          <div className="flex-1 min-h-0 overflow-y-auto pb-28">
            <CommunityBoard onSelectPet={openPet} onHaveInfo={onHaveInfo} />
          </div>
        )}

        {activeTab === "map" && (
          <div className="flex-1 min-h-0 flex flex-col pb-24">
            <MapView onSelectPet={openPet} />
          </div>
        )}

        {activeTab === "report" && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ReportLostPet />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <Profile />
          </div>
        )}
      </div>

      {!selectedPet && <BottomNav active={activeTab} onChange={onTabChange} />}

      {selectedPet && (
        <PetDetail
          pet={selectedPet}
          onBack={closePet}
          onContactOwner={() =>
            window.alert(
              "Opening owner contact… (Demo — add SMS or call integration later.)"
            )
          }
          onContactBarangay={() =>
            window.alert(
              "Connecting to barangay desk… (Demo — add official hotline later.)"
            )
          }
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/app" element={<HomeApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneFrame>
  );
}
