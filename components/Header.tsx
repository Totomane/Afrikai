import React from 'react';
import { Mic } from 'lucide-react';

interface OverlayProps {
  show: boolean;
  onVoiceClick: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ show, onVoiceClick }) => (
  <div className={`absolute top-4 w-full text-center z-10 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-500 bg-clip-text text-transparent mb-2">
      afrik.ai
    </h1>
    <div className="absolute left-1/2 -translate-x-1/2 mt-2">
      <button onClick={onVoiceClick} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 hover:bg-white/20">
        <Mic className="w-5 h-5 text-white" />
      </button>
    </div>
  </div>
);
