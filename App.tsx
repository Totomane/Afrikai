import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { GlobeMap, GlobeMapRef } from "./components/GlobeMap";
import { Overlay } from "./components/Header";
import { ResetViewButton } from "./components/ResetViewButton";
import { RiskSelector } from "./components/RiskSelector";
import { TimeSlider } from "./components/TimeSlider";
import { GeneratedMedia } from "./components/GenerateMedia";
import { UserSidebar } from "./components/UserSidebar";
import { VoiceNavigationButton } from "./components/VoiceNavigationButton";
import { useAuth } from "./components/context/authContext";
import { LandingPage } from "./components/LandingPage";
import { AuthProvider } from "./components/context/authContext";
import { ToastProvider } from "./components/ui/Toast";
import { Router } from "./components/Router";

interface CountryData {
  properties: {
    NAME?: string;
    name?: string;
    iso_a3?: string;
  };
  geometry: any;
}

// Old MainApp component - kept for reference
// Now moved to components/MainApp.tsx and integrated with authentication system

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
