import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Exercise, updateExercise } from '../lib/api/exercises';

interface EditExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
}

export function EditExerciseModal({ exercise, onClose, onSave }: EditExerciseModalProps) {
  const [formData, setFormData] = useState({
    name: exercise.name,
    category: exercise.category,
    sets: exercise.sets,
    reps: exercise.reps,
    description: exercise.description || '',
    videoUrl: exercise.videoUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updatedExercise = await updateExercise(exercise.id, formData);
      onSave(updatedExercise);
      onClose();
    } catch (err) {
      console.error('Error updating exercise:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث التمرين');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-[#0AE7F2]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">تعديل التمرين</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">اسم التمرين</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">الفئة</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              required
            >
              <option value="cardio">تمارين القلب</option>
              <option value="back">الظهر</option>
              <option value="chest">الصدر</option>
              <option value="shoulders">الأكتاف</option>
              <option value="legs">الأرجل</option>
              <option value="abs">البطن</option>
              <option value="biceps">العضلة ذات الرأسين</option>
              <option value="triceps">العضلة ذات الثلاث رؤوس</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">المجموعات</label>
              <input
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                required
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">التكرارات</label>
              <input
                type="number"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: parseInt(e.target.value) })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                required
                min="1"
                max="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2] h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">رابط الفيديو</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}