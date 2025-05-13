import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Footprints, Target, Edit2, Save, X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StepCounter } from './StepCounter';
import { BottomNav } from './BottomNav';
import { getDailySteps, getWeeklySteps, updateStepCount, updateTargetSteps } from '../lib/api/steps';

interface TraineeStepsProps {
  onBack: () => void;
}

export function TraineeSteps({ onBack }: TraineeStepsProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [targetSteps, setTargetSteps] = useState(3000);
  const [weeklySteps, setWeeklySteps] = useState<any[]>([]);
  const [editingTarget, setEditingTarget] = useState(false);
  const [newTargetSteps, setNewTargetSteps] = useState(3000);
  const [editingSteps, setEditingSteps] = useState(false);
  const [newSteps, setNewSteps] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStepData();
  }, []);

  const loadStepData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get today's steps
      const dailyData = await getDailySteps();
      if (dailyData) {
        setCurrentSteps(dailyData.steps);
        setNewSteps(dailyData.steps);
        setTargetSteps(dailyData.targetSteps);
        setNewTargetSteps(dailyData.targetSteps);
      }

      // Get weekly steps
      const weeklyData = await getWeeklySteps();
      setWeeklySteps(weeklyData);
    } catch (err) {
      console.error('Error loading step data:', err);
      setError('حدث خطأ أثناء تحميل بيانات الخطوات');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/trainee/exercise');
    }
  };

  const handleSaveTargetSteps = async () => {
    try {
      setSaving(true);
      await updateTargetSteps(newTargetSteps);
      setTargetSteps(newTargetSteps);
      setEditingTarget(false);
      
      // Refresh weekly data to update target steps
      const weeklyData = await getWeeklySteps();
      setWeeklySteps(weeklyData);
    } catch (err) {
      console.error('Error updating target steps:', err);
      setError('حدث خطأ أثناء تحديث الخطوات المستهدفة');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSteps = async () => {
    try {
      setSaving(true);
      await updateStepCount(newSteps);
      setCurrentSteps(newSteps);
      setEditingSteps(false);
      
      // Refresh weekly data to update today's entry
      const weeklyData = await getWeeklySteps();
      setWeeklySteps(weeklyData);
    } catch (err) {
      console.error('Error updating steps:', err);
      setError('حدث خطأ أثناء تحديث الخطوات');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white">
      {/* Background */}
      <div className="bg-base">
        <div className="bg-overlay">
          <div className="bg-pattern" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="header-base">
          <div className="flex justify-between items-center">
            <button onClick={handleBack} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">خطواتي اليومية</h1>
            <button className="text-white">
              <Share2 size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto content-container">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6">
              {error}
              <button 
                onClick={loadStepData}
                className="underline hover:no-underline mt-2 block w-full"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Steps Card */}
              <div className="card-base">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">خطواتي اليوم</h2>
                  {!editingSteps ? (
                    <button 
                      onClick={() => setEditingSteps(true)}
                      className="text-[#0AE7F2] hover:bg-[#0AE7F2]/10 p-2 rounded-full transition-colors"
                    >
                      <Edit2 size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingSteps(false);
                        setNewSteps(currentSteps);
                      }}
                      className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {editingSteps ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => setNewSteps(Math.max(0, newSteps - 100))}
                        className="w-12 h-12 rounded-full bg-[#0AE7F2]/10 text-[#0AE7F2] flex items-center justify-center hover:bg-[#0AE7F2]/20 transition-colors"
                      >
                        <Minus size={24} />
                      </button>
                      
                      <input
                        type="number"
                        value={newSteps}
                        onChange={(e) => setNewSteps(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-32 bg-[#1A1F2E]/40 border border-[#0AE7F2]/20 rounded-xl p-3 text-center text-2xl font-bold text-[#0AE7F2] focus:outline-none focus:border-[#0AE7F2]"
                      />
                      
                      <button 
                        onClick={() => setNewSteps(newSteps + 100)}
                        className="w-12 h-12 rounded-full bg-[#0AE7F2]/10 text-[#0AE7F2] flex items-center justify-center hover:bg-[#0AE7F2]/20 transition-colors"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleSaveSteps}
                      disabled={saving}
                      className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span>حفظ الخطوات</span>
                    </button>
                  </div>
                ) : (
                  <StepCounter steps={currentSteps} targetSteps={targetSteps} />
                )}
              </div>

              {/* Target Steps Card */}
              <div className="card-base">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">الخطوات المستهدفة</h2>
                  {!editingTarget ? (
                    <button 
                      onClick={() => setEditingTarget(true)}
                      className="text-[#0AE7F2] hover:bg-[#0AE7F2]/10 p-2 rounded-full transition-colors"
                    >
                      <Edit2 size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingTarget(false);
                        setNewTargetSteps(targetSteps);
                      }}
                      className="text-rose-500 hover:bg-rose-500/10 p-2 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {editingTarget ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Target size={24} className="text-[#0AE7F2]" />
                      <input
                        type="number"
                        value={newTargetSteps}
                        onChange={(e) => setNewTargetSteps(Math.max(1000, Math.min(20000, parseInt(e.target.value) || 3000)))}
                        className="flex-1 bg-[#1A1F2E]/40 border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                        min="1000"
                        max="20000"
                        step="500"
                      />
                    </div>
                    <button
                      onClick={handleSaveTargetSteps}
                      disabled={saving}
                      className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span>حفظ الهدف</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Target size={24} className="text-[#0AE7F2]" />
                    <div>
                      <p className="text-gray-400">الهدف اليومي</p>
                      <p className="text-2xl font-bold text-[#0AE7F2]">{targetSteps.toLocaleString()} خطوة</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Weekly Stats */}
              <div className="card-base">
                <h2 className="text-lg font-bold mb-4">إحصائيات الأسبوع</h2>
                
                <div className="space-y-4">
                  {weeklySteps.map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 w-20">
                        <Footprints size={16} className={`${isToday(day.date) ? 'text-[#0AE7F2]' : 'text-gray-400'}`} />
                        <div className="text-sm">
                          <div className={`${isToday(day.date) ? 'text-white font-bold' : 'text-white'}`}>
                            {getDayName(day.date)}
                          </div>
                          <div className="text-xs text-gray-400">{formatDate(day.date)}</div>
                        </div>
                      </div>
                      
                      <div className="flex-1 mx-4">
                        <div className="h-2 bg-[#1A1F2E]/60 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${day.steps >= day.targetSteps ? 'bg-emerald-500' : 'bg-[#0AE7F2]'} rounded-full`}
                            style={{ width: `${Math.min(100, (day.steps / day.targetSteps) * 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <span className={`font-medium w-16 text-right ${day.steps >= day.targetSteps ? 'text-emerald-500' : 'text-[#0AE7F2]'}`}>
                        {day.steps.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips Card */}
              <div className="card-base">
                <h2 className="text-lg font-bold mb-4">نصائح للنشاط</h2>
                
                <div className="space-y-3">
                  <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                    <p className="text-white">حاول المشي لمدة 30 دقيقة يومياً على الأقل</p>
                  </div>
                  
                  <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                    <p className="text-white">استخدم السلالم بدلاً من المصعد كلما أمكن</p>
                  </div>
                  
                  <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                    <p className="text-white">خذ استراحات قصيرة للمشي كل ساعة إذا كنت تعمل مكتبياً</p>
                  </div>
                  
                  <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                    <p className="text-white">حاول زيادة عدد خطواتك تدريجياً بمعدل 500 خطوة أسبوعياً</p>
                  </div>
                  
                  <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                    <p className="text-white">اجعل المشي جزءاً من روتينك اليومي للحصول على أفضل النتائج</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}