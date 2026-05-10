import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { PetsProvider } from "./context/PetsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PetsProvider>
        <App />
      </PetsProvider>
    </BrowserRouter>
  </StrictMode>
);
