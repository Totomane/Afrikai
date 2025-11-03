// src/App.tsx
import React, { useState, useRef } from 'react';
import { GlobeMap, GlobeMapRef } from './components/GlobeMap';
import { Overlay } from './components/Header';
import { ResetViewButton } from './components/ResetViewButton';
import { RiskSelector } from './components/RiskSelector';
import { TimeSlider } from './components/TimeSlider';
import { GeneratedMedia } from './components/GenerateMedia';
import { UserSidebar } from './components/UserSidebar';

interface CountryData {
  properties: {
    NAME?: string;
    name?: string;
    iso_a3?: string;
  };
  geometry: any;
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [zoomedCountry, setZoomedCountry] = useState<CountryData | null>(null);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [year, setYear] = useState<number>(2025);
  const [showOverlay, setShowOverlay] = useState(true);
  
  // Ref to access GlobeMap methods
  const globeMapRef = useRef<GlobeMapRef>(null);

  const handleResetView = () => {
    setSelectedCountry(null);
    setZoomedCountry(null);
    setShowOverlay(true);
    
    // Reset globe camera to initial position
    if (globeMapRef.current) {
      globeMapRef.current.resetToInitialView();
    }
  };

  const onVoiceClick = () => alert('Voice recognition not implemented yet.');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <GlobeMap
        ref={globeMapRef}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        setZoomedCountry={setZoomedCountry}
      />
      <Overlay show={showOverlay} onVoiceClick={onVoiceClick} />
      <UserSidebar />
      {zoomedCountry && (
        <div className="fixed top-6 right-6 z-50">
          <ResetViewButton onReset={handleResetView} />
        </div>
      )}

      {/* Contrôles directement visibles */}
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

      {/* Bouton Generate Report */}
      <GeneratedMedia
        selectedCountry={selectedCountry}
        selectedRisks={selectedRisks}
        year={year}
      />
    </div>
  );
}

export default App;