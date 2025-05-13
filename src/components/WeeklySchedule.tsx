import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { getWeeklySchedule, assignExercise, removeExercise, type WeeklySchedule as WeeklyScheduleType, createWeeklySchedule } from '../lib/api/weekly-schedule';
import { ExerciseSelectionModal } from './ExerciseSelectionModal';

interface WeeklyScheduleProps {
  traineeId: string;
}

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// Validate UUID format
const isValidUUID = (uuid: string) => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export function WeeklySchedule({ traineeId }: WeeklyScheduleProps) {
  const [schedule, setSchedule] = useState<WeeklyScheduleType | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
        setError('معرف المتدرب غير صالح');
        setLoading(false);
        return;
      }

      // Get the start of the current week (Sunday)
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const weekStartDate = startOfWeek.toISOString().split('T')[0];
      
      // Try to get existing schedule
      let weeklySchedule = await getWeeklySchedule(traineeId, weekStartDate);
      
      // If no schedule exists, create a new one
      if (!weeklySchedule && !creating) {
        try {
          setCreating(true);
          weeklySchedule = await createWeeklySchedule(traineeId, weekStartDate);
        } catch (err: any) {
          // If creation fails due to unique constraint, try fetching again
          // (handles race condition where schedule was created between our check and create)
          if (err?.message?.includes('unique_trainee_week')) {
            weeklySchedule = await getWeeklySchedule(traineeId, weekStartDate);
          } else {
            throw err;
          }
        } finally {
          setCreating(false);
        }
      }
      
      setSchedule(weeklySchedule);
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('حدث خطأ أثناء تحميل الجدول');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseSelect = async (exerciseId: string) => {
    if (!schedule || selectedDay === null) return;

    try {
      await assignExercise(schedule.id, exerciseId, selectedDay, 4, 12);
      await loadSchedule();
      setShowExerciseModal(false);
      setSelectedDay(null);
    } catch (err) {
      console.error('Error assigning exercise:', err);
      setError('حدث خطأ أثناء إضافة التمرين');
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    try {
      await removeExercise(exerciseId);
      await loadSchedule();
    } catch (err) {
      console.error('Error removing exercise:', err);
      setError('حدث خطأ أثناء حذف التمرين');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
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
        لا يوجد جدول لهذا الأسبوع
        <button 
          onClick={loadSchedule}
          className="underline hover:no-underline mt-2 block w-full"
          disabled={creating}
        >
          {creating ? 'جاري إنشاء جدول جديد...' : 'إنشاء جدول جديد'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {DAYS.map((day, index) => {
          const dayExercises = schedule.exercises.filter(ex => ex.dayOfWeek === index) || [];
          
          return (
            <div key={index} className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl border border-[#0AE7F2]/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0AE7F2]/10 p-2 rounded-lg">
                    <Calendar size={20} className="text-[#0AE7F2]" />
                  </div>
                  <h3 className="font-medium">{day}</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedDay(index);
                    setShowExerciseModal(true);
                  }}
                  className="bg-[#0AE7F2]/10 text-[#0AE7F2] p-2 rounded-lg hover:bg-[#0AE7F2]/20 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {dayExercises.length > 0 ? (
                <div className="space-y-3">
                  {dayExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between bg-[#0A0F1C]/40 rounded-lg p-3"
                    >
                      <div>
                        <p className="font-medium">{exercise.exerciseName}</p>
                        <p className="text-sm text-gray-400">
                          {exercise.sets} × {exercise.reps}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="text-rose-500 hover:text-rose-400 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">
                  لا توجد تمارين لهذا اليوم
                </p>
              )}
            </div>
          );
        })}
      </div>

      {showExerciseModal && (
        <ExerciseSelectionModal
          onClose={() => {
            setShowExerciseModal(false);
            setSelectedDay(null);
          }}
          onAssign={handleExerciseSelect}
        />
      )}
    </div>
  );
}