import React from 'react';
import { Footprints } from 'lucide-react';
import { StepCounter } from './StepCounter';

interface StepCounterWidgetProps {
  steps?: number;
  targetSteps?: number;
  onClick?: () => void;
}

export function StepCounterWidget({ steps = 0, targetSteps = 3000, onClick }: StepCounterWidgetProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-[140px] h-[140px] md:w-[140px] md:h-[140px] flex flex-col items-center justify-center group"
    >
      <div className="absolute inset-0 bg-black/50 rounded-[28px] border-2 border-[#0ae7f2]" />
      <div className="relative text-[#0AE7F2] mb-2 h-10 flex items-center">
        <Footprints size={32} className="text-[#0AE7F2]" />
      </div>
      <div className="relative text-center z-10">
        <StepCounter steps={steps} targetSteps={targetSteps} />
      </div>
    </button>
  );
}
