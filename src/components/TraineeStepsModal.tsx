import React, { useState } from 'react';
import { X, Footprints, Target, Save } from 'lucide-react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface Trainee {
  id: string;
  name: string;
  targetSteps?: number;
  [key: string]: any;
}

interface TraineeStepsModalProps {
  trainee: Trainee;
  onClose: () => void;
  onSave: (updatedTrainee: Trainee) => void;
}

export function TraineeStepsModal({ trainee, onClose, onSave }: TraineeStepsModalProps) {
  const [targetSteps, setTargetSteps] = useState(trainee.targetSteps || 3000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Check if there's an existing record for today
        const { data: existingData, error: checkError } = await supabase
          .from('trainee_steps')
          .select('id')
          .eq('trainee_id', trainee.id)
          .eq('date', today)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingData) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('trainee_steps')
            .update({
              target_steps: targetSteps,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingData.id);

          if (updateError) throw updateError;
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('trainee_steps')
            .insert({
              trainee_id: trainee.id,
              date: today,
              steps: 0,
              target_steps: targetSteps
            });

          if (insertError) throw insertError;
        }

        // Update all future records for this trainee
        const { error: futureError } = await supabase
          .from('trainee_steps')
          .update({
            target_steps: targetSteps,
            updated_at: new Date().toISOString()
          })
          .eq('trainee_id', trainee.id)
          .gte('date', today);

        if (futureError) throw futureError;
      } else {
        // Update in localStorage for development
        const storedTrainees = JSON.parse(localStorage.getItem('trainees') || '[]');
        const updatedTrainees = storedTrainees.map((t: any) => 
          t.id === trainee.id ? { ...t, targetSteps } : t
        );
        localStorage.setItem('trainees', JSON.stringify(updatedTrainees));
      }

      // Call onSave with updated trainee
      onSave({ ...trainee, targetSteps });
    } catch (err) {
      console.error('Error updating target steps:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الخطوات المستهدفة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-[#0AE7F2]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">إدارة الخطوات اليومية</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center">
              <Footprints size={24} className="text-[#0AE7F2]" />
            </div>
            <div>
              <h3 className="font-bold">{trainee.name}</h3>
              <p className="text-sm text-gray-400">{trainee.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">الخطوات المستهدفة يومياً</label>
              <div className="flex items-center gap-4">
                <Target size={24} className="text-[#0AE7F2]" />
                <input
                  type="number"
                  value={targetSteps}
                  onChange={(e) => setTargetSteps(Math.max(1000, Math.min(20000, parseInt(e.target.value) || 3000)))}
                  className="flex-1 bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  min="1000"
                  max="20000"
                  step="500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                يمكنك تعيين هدف يومي للخطوات بين 1000 و 20000 خطوة
              </p>
            </div>

            <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
              <h4 className="font-medium mb-2">معلومات مفيدة</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>• متوسط الخطوات اليومية الموصى بها: 7000-10000 خطوة</li>
                <li>• للمبتدئين: 3000-5000 خطوة</li>
                <li>• للمتوسطين: 5000-7000 خطوة</li>
                <li>• للمتقدمين: 8000-12000 خطوة</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#0AE7F2]/20">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={20} />
              )}
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}