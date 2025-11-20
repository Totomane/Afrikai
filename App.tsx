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

interface CountryData {
  properties: {
    NAME?: string;
    name?: string;
    iso_a3?: string;
  };
  geometry: any;
}

const MainApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [zoomedCountry, setZoomedCountry] = useState<CountryData | null>(null);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [year, setYear] = useState<number>(2025);
  const [showOverlay, setShowOverlay] = useState(true);
  const globeMapRef = useRef<GlobeMapRef>(null);

  // === Reset globe view ===
  const handleResetView = () => {
    setSelectedCountry(null);
    setZoomedCountry(null);
    setShowOverlay(true);
    globeMapRef.current?.resetToInitialView();
  };

  // ===  Handle result from voice command ===
  const handleVoiceResult = async (countryName: string, risk?: string, yearValue?: number) => {
    try {
      console.log(" Voice result:", { countryName, risk, yearValue });

      // Load your GeoJSON (replace with your path)
      const res = await fetch("/src/assets/custom.geo.json");
      const geo = await res.json();

      const match = geo.features.find(
        (f: any) =>
          f.properties.NAME?.toLowerCase() === countryName?.toLowerCase() ||
          f.properties.name?.toLowerCase() === countryName?.toLowerCase()
      );

      if (match) {
        setSelectedCountry(match);
        setZoomedCountry(match);
        setShowOverlay(false);
        setSelectedRisks(risk ? [risk] : []);
        if (yearValue) setYear(yearValue);
        // Focus on the country (using ref to GlobeMap)
        globeMapRef.current?.focusCountry(match);
      } else {
        alert(` Country "${countryName}" not found in map data`);
      }
    } catch (err) {
      console.error("Voice selection error:", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* Globe */}
      <GlobeMap
        ref={globeMapRef}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        setZoomedCountry={setZoomedCountry}
      />

      {/* Header overlay */}
      <Overlay show={showOverlay} />

      {/* Voice Navigation Button positioned in header area */}
      {showOverlay && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
          <VoiceNavigationButton onVoiceResult={handleVoiceResult} />
        </div>
      )}
      
      <UserSidebar />

      {/* User info and logout - only show when authenticated */}
      {user && (
        <div className="absolute top-4 right-4 z-50 bg-black/80 text-white px-4 py-3 rounded-lg flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold">{user.username}</p>
            {user.email && <p className="text-xs text-gray-300">{user.email}</p>}
          </div>
          <button
            onClick={logout}
            className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </button>
        </div>
      )}

      {/* Reset view button */}
      {zoomedCountry && (
        <div className="fixed top-6 right-6 z-50">
          <ResetViewButton onReset={handleResetView} />
        </div>
      )}

      {/* Risk selector and year slider */}
      {zoomedCountry && (
        <div className="absolute top-2 left-0 w-full flex flex-col gap-2 px-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-2 shadow-lg w-full">
            <RiskSelector selectedRisks={selectedRisks} onRiskChange={setSelectedRisks} />
          </div>

          <TimeSlider year={year} onYearChange={setYear} />

          {selectedCountry && (
            <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg w-max mt-2 z-10 border border-blue-500 mx-auto flex flex-col items-center">
              <p className="text-sm font-medium">Selected:</p>
              <p className="text-lg font-bold text-blue-400">
                {selectedCountry.properties?.NAME || selectedCountry.properties?.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Generate reports/media */}
      <GeneratedMedia
        selectedCountry={selectedCountry}
        selectedRisks={selectedRisks}
        year={year}
      />
    </motion.div>
  );
};

const App: React.FC = () => {
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGetStarted = async () => {
    setIsTransitioning(true);
    // Add a nice animation delay
    setTimeout(() => {
      setShowLandingPage(false);
      setIsTransitioning(false);
    }, 800);
  };

  // Show transition animation
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 text-white text-center">
          <div className="w-20 h-20 border-4 border-blue-300 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Loading AfrikAI Platform</h2>
          <p className="text-blue-200">Preparing your risk intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  // Show landing page or main app
  if (showLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return <MainApp />;
};

export default App;
