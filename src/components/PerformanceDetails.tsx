import React from 'react';

interface PerformanceDetailsProps {
  weeklyData: {
    day: string;
    date: string;
    completedExercises: number;
    completedMeals: number;
    value: number;
  }[];
}

export function PerformanceDetails({ weeklyData }: PerformanceDetailsProps) {
  // حساب متوسط التقدم اليومي
  const averageProgress = Math.round(
    weeklyData.reduce((sum, day) => sum + day.value, 0) / weeklyData.length
  );
  
  // حساب أفضل يوم في الأسبوع
  const bestDay = weeklyData.reduce((best, current) => 
    current.value > best.value ? current : best, 
    weeklyData[0]
  );

  return (
    <div className="mt-4 pt-4 border-t border-[#0AE7F2]/10">
      <div className="mt-4 bg-[#0A0F1C]/40 rounded-xl p-3">
        <h3 className="text-sm font-medium mb-2">تفاصيل الأداء</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <span className="text-lg font-bold text-[#0AE7F2]">{averageProgress}%</span>
            <p className="text-xs text-gray-400">متوسط التقدم</p>
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-[#0AE7F2]">{bestDay.day}</span>
            <p className="text-xs text-gray-400">أفضل يوم ({bestDay.value}%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}