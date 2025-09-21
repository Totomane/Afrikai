import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ResetViewButtonProps {
  onReset: () => void;
}

export const ResetViewButton: React.FC<ResetViewButtonProps> = ({ onReset }) => {
  return (
    <button
      onClick={onReset}
      className="relative top-1 -left-1 p-1 hover:bg-blue-100/10 rounded border border-blue-500 cursor-pointer"
      title="Reset Selection"
      style={{ left: '-1.5rem' }}
    >
      <ArrowLeft className="w-4 h-4 text-blue-500" />
    </button>
  );
};