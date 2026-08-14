import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";
import { StartupScreenGate } from "@/app/splash";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/loading";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadingProvider>
      <AuthProvider>
        <StartupScreenGate>
          <App />
        </StartupScreenGate>
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>,
);
