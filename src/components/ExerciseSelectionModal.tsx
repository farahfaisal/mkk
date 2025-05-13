import React, { useState, useEffect } from 'react';
import { Search, Dumbbell, CheckCircle, X } from 'lucide-react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: number;
  description?: string;
  videoUrl?: string;
}

interface ExerciseSelectionModalProps {
  onClose: () => void;
  onAssign: (exerciseId: string) => void;
}

export function ExerciseSelectionModal({ onClose, onAssign }: ExerciseSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        
        const formattedExercises = data.map(exercise => ({
          id: exercise.id,
          name: exercise.name,
          category: exercise.category,
          sets: exercise.sets,
          reps: exercise.reps,
          description: exercise.description,
          videoUrl: exercise.video_url
        }));
        
        setExercises(formattedExercises);
      } else {
        // Mock data for development
        setExercises([
          {
            id: '123e4567-e89b-12d3-a456-426614174010',
            name: 'بنش بريس',
            category: 'chest',
            sets: 4,
            reps: 12,
            description: 'تمرين أساسي لتقوية عضلات الصدر'
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174011',
            name: 'سكوات',
            category: 'legs',
            sets: 3,
            reps: 15,
            description: 'تمرين أساسي لتقوية عضلات الأرجل'
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174012',
            name: 'ديدليفت',
            category: 'back',
            sets: 4,
            reps: 10,
            description: 'تمرين أساسي لتقوية عضلات الظهر'
          }
        ]);
      }
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError('حدث خطأ أثناء تحميل التمارين');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExercise = () => {
    if (!selectedExercise) return;
    onAssign(selectedExercise);
    onClose();
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="p-6 border-b border-[#0AE7F2]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">اختيار تمرين</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن تمرين..."
              className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#0AE7F2]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6">
              {error}
              <button 
                onClick={loadExercises}
                className="underline hover:no-underline mt-2 block w-full"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Exercises List */}
          {!loading && !error && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  لا توجد تمارين مطابقة للبحث
                </div>
              ) : (
                filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise.id)}
                    className={`w-full p-4 rounded-xl text-right transition-colors ${
                      selectedExercise === exercise.id
                        ? 'bg-[#0AE7F2]/20 border-[#0AE7F2] text-white'
                        : 'bg-[#0A0F1C] border-[#0AE7F2]/20 hover:bg-[#0A0F1C]/80'
                    } border`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#0AE7F2]/10 p-2 rounded-lg">
                          <Dumbbell size={20} className="text-[#0AE7F2]" />
                        </div>
                        <div>
                          <h3 className="font-medium">{exercise.name}</h3>
                          <p className="text-sm text-gray-400">{exercise.category}</p>
                        </div>
                      </div>
                      {selectedExercise === exercise.id && (
                        <CheckCircle size={20} className="text-[#0AE7F2]" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#0AE7F2]">
                      <span>{exercise.sets} مجموعات</span>
                      <span>{exercise.reps} تكرار</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#0AE7F2]/20">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleAssignExercise}
              disabled={!selectedExercise || loading}
              className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50"
            >
              تعيين التمرين
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}