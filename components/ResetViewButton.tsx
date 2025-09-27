import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ResetViewButtonProps {
  onReset: () => void;
}

export const ResetViewButton: React.FC<ResetViewButtonProps> = ({ onReset }) => {
  return (
    <button
      onClick={onReset}
      className="
        p-1 rounded-full 
        bg-black/80 backdrop-blur-sm 
        border-2 border-blue-500 
        hover:bg-blue-500/20 hover:border-blue-400 hover:scale-110
        transition-all duration-300 ease-in-out
        shadow-lg hover:shadow-xl hover:shadow-blue-500/25
        group
      "
      title="Reset View"
    >
      <ArrowLeft className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors duration-200" />
    </button>
  );
};