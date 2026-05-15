import { Navigate, Route, Routes } from "react-router-dom";
import { PhoneFrame } from "./components/PhoneFrame";
import { SplashPage } from "./pages/SplashPage";
import { MainShell } from "./MainShell";

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/app" element={<MainShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneFrame>
  );
}
