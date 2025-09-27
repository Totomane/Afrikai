import React from 'react';

interface TimeSliderProps {
  year: number;
  onYearChange: (newYear: number) => void;
  min?: number;
  max?: number;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({ year, onYearChange, min = 2025, max = 2030 }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onYearChange(Number(e.target.value));
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-2 shadow-lg w-full">
      <label className="block text-white mb-1 font-medium text-xs">Select Year: {year}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={year}
        onChange={handleChange}
        className="w-full h-1 bg-gray-700 rounded-lg accent-blue-500"
      />
    </div>
  );
};
