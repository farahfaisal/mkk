import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X, Coffee, UtensilsCrossed, Moon, Cookie, Loader2 } from 'lucide-react';
import { getMealSchedule, assignMeal, removeMeal, type MealSchedule as MealScheduleType } from '../lib/api/meal-schedule';
import { MealSearchAssignment } from './MealSearchAssignment';

interface WeeklyMealScheduleProps {
  traineeId: string;
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const TIMINGS = [
  { id: 'breakfast', name: 'فطور', icon: Coffee },
  { id: 'lunch', name: 'غداء', icon: UtensilsCrossed },
  { id: 'dinner', name: 'عشاء', icon: Moon },
  { id: 'snack', name: 'وجبة خفيفة', icon: Cookie }
] as const;

// Validate UUID format
const isValidUUID = (uuid: string) => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export function WeeklyMealSchedule({ traineeId }: WeeklyMealScheduleProps) {
  const [schedule, setSchedule] = useState<MealScheduleType | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<typeof TIMINGS[number]['id'] | null>(null);
  const [showMealSearch, setShowMealSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [traineeId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate traineeId is a valid UUID
      if (!isValidUUID(traineeId)) {
        console.warn('Invalid trainee ID format:', traineeId);
        // Use a fallback ID for development
        const fallbackId = '123e4567-e89b-12d3-a456-426614174030';
        const mealSchedule = await getMealSchedule(
          fallbackId,
          new Date().toISOString().split('T')[0]
        );
        setSchedule(mealSchedule);
        return;
      }

      // Get the start of the current week (Sunday)
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const mealSchedule = await getMealSchedule(
        traineeId,
        startOfWeek.toISOString().split('T')[0]
      );
      
      setSchedule(mealSchedule);
    } catch (err) {
      console.error('Error loading meal schedule:', err);
      setError('حدث خطأ أثناء تحميل جدول الوجبات');
    } finally {
      setLoading(false);
    }
  };

  const handleMealSelect = async (mealId: string) => {
    if (!schedule || selectedDay === null || !selectedTiming) return;

    try {
      setActionLoading(true);
      await assignMeal(schedule.id, mealId, selectedDay, selectedTiming);
      await loadSchedule();
      setShowMealSearch(false);
      setSelectedDay(null);
      setSelectedTiming(null);
    } catch (err) {
      console.error('Error assigning meal:', err);
      setError('حدث خطأ أثناء إضافة الوجبة');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMeal = async (mealId: string) => {
    try {
      setActionLoading(true);
      await removeMeal(mealId);
      await loadSchedule();
    } catch (err) {
      console.error('Error removing meal:', err);
      setError('حدث خطأ أثناء حذف الوجبة');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={40} className="text-[#0AE7F2] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
        {error}
        <button 
          onClick={loadSchedule}
          className="underline hover:no-underline mt-2 block w-full"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="bg-amber-500/10 border border-amber-500 text-amber-500 p-4 rounded-xl text-center">
        لا يوجد جدول وجبات لهذا الأسبوع
        <button 
          onClick={loadSchedule}
          className="underline hover:no-underline mt-2 block w-full"
        >
          إنشاء جدول جديد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 size={40} className="text-[#0AE7F2] animate-spin" />
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {DAYS.map((day, dayIndex) => {
          const dayMeals = schedule?.meals.filter(meal => meal.dayOfWeek === dayIndex) || [];
          
          return (
            <div key={dayIndex} className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl border border-[#0AE7F2]/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0AE7F2]/10 p-2 rounded-lg">
                    <Calendar size={20} className="text-[#0AE7F2]" />
                  </div>
                  <h3 className="font-medium">{day}</h3>
                </div>
              </div>

              <div className="space-y-4">
                {TIMINGS.map((timing) => {
                  const timingMeals = dayMeals.filter(meal => meal.timing === timing.id);
                  const TimingIcon = timing.icon;

                  return (
                    <div key={timing.id} className="bg-[#0A0F1C]/40 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TimingIcon size={16} className="text-[#0AE7F2]" />
                          <span className="text-sm font-medium">{timing.name}</span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDay(dayIndex);
                            setSelectedTiming(timing.id);
                            setShowMealSearch(true);
                          }}
                          className="bg-[#0AE7F2]/10 text-[#0AE7F2] p-1.5 rounded-lg hover:bg-[#0AE7F2]/20 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {timingMeals.length > 0 ? (
                        <div className="space-y-2">
                          {timingMeals.map((meal) => (
                            <div
                              key={meal.id}
                              className="flex items-center justify-between bg-[#1A1F2E]/40 rounded-lg p-3"
                            >
                              <div>
                                <p className="font-medium">{meal.mealName}</p>
                                <p className="text-sm text-[#0AE7F2]">
                                  {meal.calories} سعرة
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveMeal(meal.id)}
                                className="text-rose-500 hover:text-rose-400 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-400 text-sm py-2">
                          لا توجد وجبات
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showMealSearch && (
        <MealSearchAssignment
          onBack={() => {
            setShowMealSearch(false);
            setSelectedDay(null);
            setSelectedTiming(null);
          }}
          onAssign={handleMealSelect}
          traineeId={traineeId}
          dayOfWeek={selectedDay || undefined}
          timing={selectedTiming || undefined}
        />
      )}
    </div>
  );
}