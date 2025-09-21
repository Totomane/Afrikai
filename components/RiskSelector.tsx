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
    if (selectedRisks.includes(riskId)) {
      onRiskChange(selectedRisks.filter(id => id !== riskId));
    } else {
      if (selectedRisks.length < 3) {
        onRiskChange([...selectedRisks, riskId]);
      }
    }
  };

  return (
    <div className="bg-transparent rounded-lg p-1 w-full relative">
      {/* Bouton Reset / Flèche en haut à gauche */}
      {onReset && (
        <button
          onClick={onReset}
          className="absolute top-1 left-1 p-5 hover:bg-white/10 rounded"
          title="Reset Selection"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      )}

      <h3 className="text-[0.65rem] font-semibold text-white mb-1">Risk Assessment Categories</h3>

      <div className="grid grid-cols-5 gap-2">
        {RISK_TYPES.map((risk) => {
          const isSelected = selectedRisks.includes(risk.id);
          const disabled = !isSelected && selectedRisks.length >= 3;
          return (
            <label
              key={risk.id}
              className={`flex items-center space-x-1 p-1 rounded cursor-pointer hover:bg-white/5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ fontSize: '1rem', lineHeight: '1.3rem', fontWeight: 600 }}
            >
              <div className="relative">
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleRiskToggle(risk.id)}
                className="sr-only"
                disabled={disabled}
              />
              <span className={`font-bold ${isSelected ? 'text-blue-500' : 'text-gray-300'}`}>
                {risk.label}
              </span>
            </label>
          );
        })}
      </div>

      {selectedRisks.length > 0 && (
        <div className="mt-1 pt-1 border-t border-blue-500/20">
          <p className="text-[0.6rem] text-blue-500">
            {selectedRisks.length} risk{selectedRisks.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};
