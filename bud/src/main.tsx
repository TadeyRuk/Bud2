import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { PetsProvider } from "./context/PetsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PetsProvider>
      <App />
    </PetsProvider>
  </StrictMode>
);
