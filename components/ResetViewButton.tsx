import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetViewButtonProps {
  onReset: () => void;
}

export const ResetViewButton: React.FC<ResetViewButtonProps> = ({ onReset }) => {
  return (
    <button
      onClick={onReset}
      className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-sm border border-white/20 rounded-full p-3 hover:bg-white/20 transition-all duration-200 group"
      title="Reset view"
    >
      <RotateCcw className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-300" />
    </button>
  );
};