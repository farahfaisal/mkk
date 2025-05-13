import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { WeeklyPerformanceGraph } from './WeeklyPerformanceGraph';
import { getWeeklyPerformance, generateMockWeeklyPerformance } from '../lib/api/performance';

interface DashboardPerformanceProps {
  className?: string;
}

export function DashboardPerformance({ className = '' }: DashboardPerformanceProps) {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyProgress();
  }, []);

  const fetchWeeklyProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب بيانات الأداء الأسبوعي
      const performanceData = await getWeeklyPerformance();
      
      if (performanceData.length > 0) {
        setWeeklyData(performanceData);
      } else {
        // إذا لم تكن هناك بيانات، قم بإنشاء بيانات وهمية
        await generateMockWeeklyPerformance();
        const newData = await getWeeklyPerformance();
        setWeeklyData(newData);
      }
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
      setError('حدث خطأ أثناء تحميل بيانات الأداء');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-[#1A1F2E]/60 backdrop-blur-sm rounded-2xl border border-[#0AE7F2]/20 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">الأداء الأسبوعي</h2>
        <button 
          onClick={fetchWeeklyProgress}
          disabled={loading}
          className="p-2 hover:bg-[#0AE7F2]/10 rounded-full transition-colors text-[#0AE7F2] disabled:opacity-50"
          title="تحديث"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <WeeklyPerformanceGraph 
        data={weeklyData} 
        loading={loading}
        error={error}
        onRetry={fetchWeeklyProgress}
      />
    </div>
  );
}