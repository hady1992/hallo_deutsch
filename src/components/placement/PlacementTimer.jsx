import React from 'react';
import { Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const PlacementTimer = ({ remainingSeconds }) => {
  const isWarning = remainingSeconds <= 5 * 60;
  return (
    <div
      role="timer"
      aria-live={isWarning ? 'polite' : 'off'}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-md border bg-white px-3 font-bold tabular-nums',
        isWarning ? 'border-amber-300 text-amber-800' : 'border-black/10 text-slate-700'
      )}
      dir="ltr"
    >
      <Clock3 size={18} aria-hidden="true" />
      <span>{formatTime(remainingSeconds)}</span>
      <span className="sr-only">الوقت المتبقي</span>
    </div>
  );
};

export default PlacementTimer;
