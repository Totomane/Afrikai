import React, { useState, useRef } from "react";
import { GlobeMap, GlobeMapRef } from "./components/GlobeMap";
import { Overlay } from "./components/Header";
import { ResetViewButton } from "./components/ResetViewButton";
import { RiskSelector } from "./components/RiskSelector";
import { TimeSlider } from "./components/TimeSlider";
import { GeneratedMedia } from "./components/GenerateMedia";
import { UserSidebar } from "./components/UserSidebar";
import { VoiceNavigationButton } from "./components/VoiceNavigationButton";

interface CountryData {
  properties: {
    NAME?: string;
    name?: string;
    iso_a3?: string;
  };
  geometry: any;
}

const App: React.FC = () => {
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
    <div className="relative w-full h-screen overflow-hidden bg-black">
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
    </div>
  );
};

export default App;
