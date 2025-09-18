// src/App.tsx
import React, { useState } from 'react';
import { GlobeMap } from './components/GlobeMap';
import { Overlay } from './components/Header';
import { ResetViewButton } from './components/ResetViewButton';
import { RiskSelector } from './components/RiskSelector';
import { TimeSlider } from './components/TimeSlider';
import { GeneratedDocument } from './components/GenerateDocumentButton';

interface CountryData {
  properties: {
    NAME?: string;
    name?: string;
  };
  geometry: any;
}

function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [zoomedCountry, setZoomedCountry] = useState<CountryData | null>(null);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [year, setYear] = useState<number>(2025);
  const [showOverlay, setShowOverlay] = useState(true);

  const handleResetView = () => {
    setSelectedCountry(null);
    setZoomedCountry(null);
    setShowOverlay(true);
  };

  const onVoiceClick = () => alert('Voice recognition not implemented yet.');

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <GlobeMap
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        setZoomedCountry={setZoomedCountry}
      />
      <Overlay show={showOverlay} onVoiceClick={onVoiceClick} />
      {zoomedCountry && <ResetViewButton onReset={handleResetView} />}

      {/* Contrôles directement visibles */}
      {zoomedCountry && (
        <div className="absolute top-2 left-0 w-full flex flex-col gap-2 px-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-2 shadow-lg w-full">
            <RiskSelector selectedRisks={selectedRisks} onRiskChange={setSelectedRisks} />
          </div>
          <TimeSlider year={year} onYearChange={setYear} min={2000} max={2030} />
          {selectedCountry && (
            <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg w-max mt-2 z-10">
              <p className="text-sm font-medium">Selected:</p>
              <p className="text-lg font-bold text-emerald-400">
                {selectedCountry.properties?.NAME || selectedCountry.properties?.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bouton Generate Report */}
      <GeneratedDocument 
        selectedCountry={selectedCountry}
        selectedRisks={selectedRisks}
        year={year}
      />
    </div>
  );
}

export default App;