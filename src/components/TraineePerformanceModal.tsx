import React, { useState, useEffect } from 'react';
import { X, Activity, Dumbbell, Apple } from 'lucide-react';
import { getTraineePerformance, getTraineeMeals } from '../lib/api/trainee-meals';

interface TraineePerformanceModalProps {
  traineeId: string;
  onClose: () => void;
}

export function TraineePerformanceModal({ traineeId, onClose }: TraineePerformanceModalProps) {
  const [performance, setPerformance] = useState({
    completedExercises: 0,
    totalExercises: 0,
    completedMeals: 0,
    totalMeals: 0,
    progress: 0
  });
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [performanceData, mealsData] = await Promise.all([
          getTraineePerformance(traineeId),
          getTraineeMeals(traineeId)
        ]);
        setPerformance(performanceData);
        setMeals(mealsData);
      } catch (error) {
        console.error('Error fetching trainee data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [traineeId]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[#0AE7F2]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">أداء المتدرب</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Dumbbell size={20} className="text-[#0AE7F2]" />
                    <h3 className="text-sm font-bold">التمارين</h3>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#0AE7F2]">
                      {performance.completedExercises}/{performance.totalExercises}
                    </p>
                    <p className="text-xs text-gray-400">تمرين مكتمل</p>
                  </div>
                </div>

                <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Apple size={20} className="text-[#0AE7F2]" />
                    <h3 className="text-sm font-bold">الوجبات</h3>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#0AE7F2]">
                      {performance.completedMeals}/{performance.totalMeals}
                    </p>
                    <p className="text-xs text-gray-400">وجبة مكتملة</p>
                  </div>
                </div>

                <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity size={20} className="text-[#0AE7F2]" />
                    <h3 className="text-sm font-bold">التقدم الكلي</h3>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#0AE7F2]">
                      {performance.progress}%
                    </p>
                    <p className="text-xs text-gray-400">نسبة الإنجاز</p>
                  </div>
                </div>
              </div>

              {/* Recent Meals */}
              <div className="bg-[#0A0F1C]/40 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">الوجبات المضافة</h3>
                <div className="space-y-4">
                  {meals.map((meal: any) => (
                    <div key={meal.id} className="bg-[#1A1F2E]/40 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-[#0AE7F2]">{meal.calories} سعرة</div>
                        <div>
                          <h4 className="font-medium mb-1">{meal.name}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(meal.date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>بروتين: {meal.protein}g</span>
                        <span>كربوهيدرات: {meal.carbs}g</span>
                        <span>دهون: {meal.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}