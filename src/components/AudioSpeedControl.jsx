import React, { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AudioSpeedControl = ({ onSpeedChange, initialSpeed = 1.0, className = "" }) => {
  const [speed, setSpeed] = useState(initialSpeed);

  useEffect(() => {
    // Load preference from localStorage on mount
    const savedSpeed = parseFloat(localStorage.getItem('audioPlaybackSpeed'));
    if (!isNaN(savedSpeed)) {
      setSpeed(savedSpeed);
      onSpeedChange(savedSpeed);
    }
  }, []);

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
    localStorage.setItem('audioPlaybackSpeed', newSpeed.toString());
  };

  const speeds = [0.75, 1.0, 1.25];

  return (
    <div className={`flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-full border border-slate-200 shadow-sm ${className}`}>
      <div className="bg-slate-100 p-1.5 rounded-full text-slate-500">
        <Gauge size={16} />
      </div>
      <div className="flex gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            className={`
              px-2 py-1 text-xs font-bold rounded-md transition-all
              ${speed === s 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
            `}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};

export default AudioSpeedControl;