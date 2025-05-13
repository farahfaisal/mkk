import React, { useState } from 'react';
import { X, Eye, EyeOff, Dumbbell, Percent, Ruler } from 'lucide-react';

interface EditTraineeModalProps {
  trainee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    plan: string;
    height?: number;
    weight?: number;
    targetWeight?: number;
    fatPercentage?: number;
    muscleMass?: number;
    goals?: string[];
    age?: number;
    gender?: 'male' | 'female';
    currentWeight: number;
    initialWeight: number;
    currentFat: number;
    initialFat: number;
    currentMuscle: number;
    initialMuscle: number;
    currentWaist: number;
    initialWaist: number;
    currentNeck: number;
    initialNeck: number;
    currentArm: number;
    initialArm: number;
  };
  onClose: () => void;
  onSave: (traineeId: string, data: any) => void;
}

export function EditTraineeModal({ trainee, onClose, onSave }: EditTraineeModalProps) {
  const [formData, setFormData] = useState({
    name: trainee.name || '',
    email: trainee.email || '',
    phone: trainee.phone || '',
    plan: trainee.plan || 'basic',
    height: trainee.height || 170,
    currentWeight: trainee.currentWeight || 70,
    initialWeight: trainee.initialWeight || 70,
    targetWeight: trainee.targetWeight || 70,
    currentFat: trainee.currentFat || 0,
    initialFat: trainee.initialFat || 0,
    currentMuscle: trainee.currentMuscle || 0,
    initialMuscle: trainee.initialMuscle || 0,
    currentWaist: trainee.currentWaist || 0,
    initialWaist: trainee.initialWaist || 0,
    currentNeck: trainee.currentNeck || 0,
    initialNeck: trainee.initialNeck || 0,
    currentArm: trainee.currentArm || 0,
    initialArm: trainee.initialArm || 0,
    goals: trainee.goals || [],
    age: trainee.age || 25,
    gender: trainee.gender || 'male'
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    const dataToSave = {
      ...formData,
      ...(passwordData.newPassword ? { password: passwordData.newPassword } : {})
    };

    onSave(trainee.id, dataToSave);
  };

  const plans = [
    { id: 'basic', name: 'الخطة الأساسية' },
    { id: 'premium', name: 'الخطة المتقدمة' },
    { id: 'pro', name: 'الخطة الاحترافية' }
  ];

  const goals = [
    { id: 'weight_loss', name: 'خسارة الوزن', icon: '🎯' },
    { id: 'muscle_gain', name: 'زيادة العضلات', icon: '💪' },
    { id: 'fitness', name: 'اللياقة البدنية', icon: '🏃‍♂️' },
    { id: 'strength', name: 'القوة', icon: '🏋️‍♂️' },
    { id: 'flexibility', name: 'المرونة', icon: '🧘‍♂️' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-[#0AE7F2]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">تعديل بيانات المتدرب</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-[#0A0F1C]/40 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold mb-4 text-[#0AE7F2]">المعلومات الشخصية</h3>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">الاسم</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">العمر</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                  min="12"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">الجنس</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>

            {/* Password Update */}
            <div className="bg-[#0A0F1C]/40 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold mb-4 text-[#0AE7F2]">تحديث كلمة المرور</h3>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                    placeholder="اترك فارغاً للاحتفاظ بكلمة المرور الحالية"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                    placeholder="اترك فارغاً للاحتفاظ بكلمة المرور الحالية"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Physical Measurements */}
            <div className="bg-[#0A0F1C]/40 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold mb-4 text-[#0AE7F2]">القياسات الجسدية</h3>

              <div>
                <label className="block text-sm text-gray-400 mb-1">الطول (سم)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>

              {/* Weight Section */}
              <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Ruler size={18} className="text-[#0AE7F2]" />
                  <h3 className="text-sm font-bold text-[#0AE7F2]">الوزن</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">الوزن الحالي (كجم)</label>
                    <input
                      type="number"
                      value={formData.currentWeight}
                      onChange={(e) => setFormData({ ...formData, currentWeight: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">الوزن السابق (كجم)</label>
                    <input
                      type="number"
                      value={formData.initialWeight}
                      onChange={(e) => setFormData({ ...formData, initialWeight: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Body Fat Section */}
              <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Percent size={18} className="text-[#0AE7F2]" />
                  <h3 className="text-sm font-bold text-[#0AE7F2]">نسبة الدهون</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">النسبة الحالية (%)</label>
                    <input
                      type="number"
                      value={formData.currentFat}
                      onChange={(e) => setFormData({ ...formData, currentFat: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">النسبة السابقة (%)</label>
                    <input
                      type="number"
                      value={formData.initialFat}
                      onChange={(e) => setFormData({ ...formData, initialFat: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Muscle Mass Section */}
              <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Dumbbell size={18} className="text-[#0AE7F2]" />
                  <h3 className="text-sm font-bold text-[#0AE7F2]">الكتلة العضلية</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">النسبة الحالية (%)</label>
                    <input
                      type="number"
                      value={formData.currentMuscle}
                      onChange={(e) => setFormData({ ...formData, currentMuscle: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">النسبة السابقة (%)</label>
                    <input
                      type="number"
                      value={formData.initialMuscle}
                      onChange={(e) => setFormData({ ...formData, initialMuscle: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Body Measurements */}
              <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Ruler size={18} className="text-[#0AE7F2]" />
                  <h3 className="text-sm font-bold text-[#0AE7F2]">قياسات الجسم</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">محيط البطن الحالي (سم)</label>
                    <input
                      type="number"
                      value={formData.currentWaist}
                      onChange={(e) => setFormData({ ...formData, currentWaist: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">محيط البطن السابق (سم)</label>
                    <input
                      type="number"
                      value={formData.initialWaist}
                      onChange={(e) => setFormData({ ...formData, initialWaist: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">محيط العنق الحالي (سم)</label>
                    <input
                      type="number"
                      value={formData.currentNeck}
                      onChange={(e) => setFormData({ ...formData, currentNeck: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">محيط العنق السابق (سم)</label>
                    <input
                      type="number"
                      value={formData.initialNeck}
                      onChange={(e) => setFormData({ ...formData, initialNeck: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">محيط الذراع الحالي (سم)</label>
                    <input
                      type="number"
                      value={formData.currentArm}
                      onChange={(e) => setFormData({ ...formData, currentArm: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">محيط الذراع السابق (سم)</label>
                    <input
                      type="number"
                      value={formData.initialArm}
                      onChange={(e) => setFormData({ ...formData, initialArm: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Plan */}
            <div className="bg-[#0A0F1C]/40 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold mb-4 text-[#0AE7F2]">خطة الاشتراك</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {plans.map(plan => (
                  <label
                    key={plan.id}
                    className={`block p-4 rounded-xl cursor-pointer transition-all ${
                      formData.plan === plan.id
                        ? 'bg-[#0AE7F2]/20 border-[#0AE7F2] text-[#0AE7F2]'
                        : 'bg-[#0A0F1C] border-[#0AE7F2]/20 hover:bg-[#0AE7F2]/10'
                    } border`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={formData.plan === plan.id}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                      className="hidden"
                    />
                    <div className="text-center">
                      <h4 className="font-bold">{plan.name}</h4>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="bg-[#0A0F1C]/40 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold mb-4 text-[#0AE7F2]">الأهداف</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {goals.map(goal => (
                  <label
                    key={goal.id}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                      formData.goals.includes(goal.id)
                        ? 'bg-[#0AE7F2]/20 border-[#0AE7F2] text-[#0AE7F2]'
                        : 'bg-[#0A0F1C] border-[#0AE7F2]/20 hover:bg-[#0AE7F2]/10'
                    } border`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.goals.includes(goal.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, goals: [...formData.goals, goal.id] });
                        } else {
                          setFormData({ ...formData, goals: formData.goals.filter(g => g !== goal.id) });
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-2xl">{goal.icon}</span>
                    <span>{goal.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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