import React from 'react';
import { CheckCircle2, Circle, ArrowLeft } from 'lucide-react';

interface RiskSelectorProps {
  selectedRisks: string[];
  onRiskChange: (risks: string[]) => void;
  onReset?: () => void; // reset sélection si nécessaire
}

const RISK_TYPES = [
  { id: 'climate', label: 'Climate Change' },
  { id: 'cyber', label: 'Cyber Security' },
  { id: 'financial', label: 'Financial Crisis' },
  { id: 'geopolitical', label: 'Geopolitical Tensions' },
  { id: 'pandemic', label: 'Pandemic Outbreak' },
  { id: 'supply-chain', label: 'Supply Chain Disruption' },
  { id: 'energy', label: 'Energy Crisis' },
  { id: 'water', label: 'Water Scarcity' },
  { id: 'food', label: 'Food Security' },
  { id: 'migration', label: 'Mass Migration' },
  { id: 'terrorism', label: 'Terrorism' },
  { id: 'natural-disaster', label: 'Natural Disasters' },
  { id: 'economic', label: 'Economic Recession' },
  { id: 'technology', label: 'Technology Disruption' },
  { id: 'social', label: 'Social Unrest' }
];

export const RiskSelector: React.FC<RiskSelectorProps> = ({
  selectedRisks,
  onRiskChange,
  onReset
}) => {
  const handleRiskToggle = (riskId: string) => {
    const updatedRisks = selectedRisks.includes(riskId)
      ? selectedRisks.filter(id => id !== riskId)
      : [...selectedRisks, riskId];

    onRiskChange(updatedRisks);
  };

  return (
    <div className="bg-transparent rounded-lg p-1 w-full relative">
      {/* Bouton Reset / Flèche en haut à gauche */}
      {onReset && (
        <button
          onClick={onReset}
          className="absolute top-1 left-1 p-1 hover:bg-white/10 rounded"
          title="Reset Selection"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      )}

      <h3 className="text-[0.65rem] font-semibold text-white mb-1">Risk Assessment Categories</h3>

      <div className="grid grid-cols-3 gap-1">
        {RISK_TYPES.map((risk) => {
          const isSelected = selectedRisks.includes(risk.id);

          return (
            <label
              key={risk.id}
              className="flex items-center space-x-1 p-[2px] rounded cursor-pointer hover:bg-white/5"
              style={{ fontSize: '0.65rem', lineHeight: '1rem' }}
            >
              <div className="relative">
                {isSelected ? (
                  <CheckCircle2 className="w-2.5 h-2.5 text-amber-500" />
                ) : (
                  <Circle className="w-2.5 h-2.5 text-gray-400" />
                )}
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleRiskToggle(risk.id)}
                className="sr-only"
              />
              <span className={`font-medium ${isSelected ? 'text-amber-500' : 'text-gray-300'}`}>
                {risk.label}
              </span>
            </label>
          );
        })}
      </div>

      {selectedRisks.length > 0 && (
        <div className="mt-1 pt-1 border-t border-white/10">
          <p className="text-[0.6rem] text-amber-500">
            {selectedRisks.length} risk{selectedRisks.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};
