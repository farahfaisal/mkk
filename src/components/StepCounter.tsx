import React from 'react';
import { Footprints } from 'lucide-react';

interface StepCounterProps {
  steps: number;
  targetSteps: number;
}

export function StepCounter({ steps, targetSteps }: StepCounterProps) {
  // Calculate progress percentage
  const progress = Math.min(100, Math.round((steps / targetSteps) * 100));
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 75) return 'bg-[#0AE7F2]';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-[#0AE7F2]';
  };
  
  // Determine text color based on progress
  const getTextColor = () => {
    if (progress >= 100) return 'text-emerald-500';
    if (progress >= 75) return 'text-[#0AE7F2]';
    if (progress >= 50) return 'text-amber-500';
    return 'text-[#0AE7F2]';
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-2">
          <Footprints size={24} className="text-[#0AE7F2] mr-2" />
          <h3 className="text-lg font-medium text-white">خطواتي اليومية</h3>
        </div>
        
        <div className="relative w-full h-4 bg-[#1A1F2E]/60 rounded-full overflow-hidden mb-2">
          <div 
            className={`absolute top-0 right-0 h-full ${getProgressColor()} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="flex justify-between w-full text-sm">
          <span className={`${getTextColor()} font-bold text-xl`}>{steps.toLocaleString()}</span>
          <span className="text-gray-400">الهدف: {targetSteps.toLocaleString()}</span>
        </div>
        
        {progress >= 100 && (
          <div className="mt-2 bg-emerald-500/10 border border-emerald-500 text-emerald-500 px-4 py-2 rounded-xl text-center">
            أحسنت! لقد حققت هدفك اليومي 🎉
          </div>
        )}
      </div>
    </div>
  );
}