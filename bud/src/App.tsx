import { Navigate, Route, Routes } from "react-router-dom";
import { PhoneFrame } from "./components/PhoneFrame";
import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SplashPage } from "./pages/SplashPage";
import { WelcomePage } from "./pages/WelcomePage";
import { MainShell } from "./MainShell";

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/signin" element={<AuthPage mode="signin" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/app" element={<MainShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneFrame>
  );
}
