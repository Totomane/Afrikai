// src/components/Header.tsx
import React from 'react';

interface OverlayProps {
  show: boolean;
}

export const Overlay: React.FC<OverlayProps> = ({ show }) => {
  return (
    <div className={`absolute top-4 w-full text-center z-10 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-500 bg-clip-text text-transparent mb-2">
        afrik.ai
      </h1>
    </div>
  );
};
