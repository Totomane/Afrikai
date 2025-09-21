import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ResetViewButtonProps {
  onReset: () => void;
}

export const ResetViewButton: React.FC<ResetViewButtonProps> = ({ onReset }) => {
  return (
    <button
          onClick={onReset}
          className="absolute top-1 left-1 p-1 hover:bg-white/10 rounded"
          title="Reset Selection"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
  );
};