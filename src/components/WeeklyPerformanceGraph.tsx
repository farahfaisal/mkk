import React, { useMemo } from 'react';
import { formatDate } from '../lib/utils/date';

interface WeeklyPerformanceGraphProps {
  data: {
    day: string;
    date: string;
    completedExercises: number;
    completedMeals: number;
    value: number;
  }[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const GRAPH_CONSTANTS = {
  width: 340,
  height: 180,
  minValue: 0,
  maxValue: 100,
  padding: { left: 0, right: 0, top: 10, bottom: 10 }
};

const Y_AXIS_LABELS = ['100%', '80%', '60%', '40%', '20%', '0%'];

export function WeeklyPerformanceGraph({ data, loading, error, onRetry }: WeeklyPerformanceGraphProps) {
  const generateSmoothPath = useMemo(() => {
    if (!data.length) return '';

    const { width, height, minValue, maxValue, padding } = GRAPH_CONSTANTS;
    const valueRange = maxValue - minValue;
    const effectiveWidth = width - padding.left - padding.right;
    const effectiveHeight = height - padding.top - padding.bottom;

    const points = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * effectiveWidth,
      y: padding.top + effectiveHeight - ((d.value - minValue) / valueRange) * effectiveHeight
    }));

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp2x = current.x + 2 * (next.x - current.x) / 3;
      
      const cp1y = current.y;
      const cp2y = next.y;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }

    return path;
  }, [data]);

  const generateAreaPath = useMemo(() => {
    if (!data.length) return '';
    const { width, height, padding } = GRAPH_CONSTANTS;
    return `${generateSmoothPath} L ${width - padding.right},${height - padding.bottom} L ${padding.left},${height - padding.bottom} Z`;
  }, [generateSmoothPath, data]);

  const peakPosition = useMemo(() => {
    if (!data.length) {
      return { x: 0, y: 0, value: 0, dayIndex: 0 };
    }

    const maxValue = Math.max(...data.map(d => d.value));
    const maxIndex = data.findIndex(d => d.value === maxValue);
    const { width, height, minValue, maxValue: maxVal, padding } = GRAPH_CONSTANTS;
    const valueRange = maxVal - minValue;
    const effectiveWidth = width - padding.left - padding.right;
    const effectiveHeight = height - padding.top - padding.bottom;
    
    const x = padding.left + (maxIndex / (data.length - 1)) * effectiveWidth;
    const y = padding.top + effectiveHeight - ((maxValue - minValue) / valueRange) * effectiveHeight;
    
    return { x, y, value: maxValue, dayIndex: maxIndex };
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-10 h-10 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center h-48 flex flex-col items-center justify-center">
        <p>{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="underline hover:no-underline mt-2"
          >
            إعادة المحاولة
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-48">
      {/* Y-Axis Labels */}
      <div className="absolute right-0 inset-y-0 flex flex-col justify-between pr-1">
        {Y_AXIS_LABELS.map((label, i) => (
          <div key={i} className="text-[10px] text-white -translate-y-1/2">
            {label}
          </div>
        ))}
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between mr-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="w-full border-t border-dashed border-white/30"
          />
        ))}
      </div>

      {/* Graph */}
      <div className="absolute inset-0 mr-6">
        {/* Peak Value Highlight - مستطيل يوم الأداء الأفضل */}
        {data.length > 0 && (
          <div 
            className="absolute bottom-0 rounded-t-sm"
            style={{
              left: `${(peakPosition.dayIndex / (data.length - 1)) * 100}%`,
              transform: 'translateX(-50%)',
              width: '20px',
              height: `${GRAPH_CONSTANTS.height - peakPosition.y - GRAPH_CONSTANTS.padding.bottom}px`,
              background: 'linear-gradient(180deg, rgba(10, 231, 242, 0.7) 0%, rgba(10, 231, 242, 0.2) 100%)',
              zIndex: 1
            }}
          />
        )}

        {/* SVG Graph */}
        <svg width="100%" height="100%" viewBox={`0 0 ${GRAPH_CONSTANTS.width} ${GRAPH_CONSTANTS.height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0AE7F2" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0AE7F2" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area Fill */}
          <path
            d={generateAreaPath}
            fill="url(#gradient)"
          />
          {/* Line */}
          <path
            d={generateSmoothPath}
            fill="none"
            stroke="#0AE7F2"
            strokeWidth="2"
          />
          {/* Peak Value Label */}
          <foreignObject
            x={peakPosition.x - 15}
            y={peakPosition.y - 20}
            width="30"
            height="15"
          >
            <div className="bg-[#0AE7F2] text-black text-[8px] font-bold rounded-full px-2 py-0.5 text-center">
              {peakPosition.value}%
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* X-Axis Labels (Days of Week) */}
      <div className="absolute bottom-0 left-0 right-6 flex justify-between">
        {data.map((d, i) => (
          <div key={i} className={`text-[10px] flex flex-col items-center ${i === peakPosition.dayIndex ? 'text-[#0AE7F2] font-bold' : 'text-white'}`}>
            <span className="mb-1">{d.day}</span>
            <span className="text-[8px] text-gray-400">{formatDate(d.date, 'MM-dd')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}