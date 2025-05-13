import React, { useState } from 'react';
import { Eye, EyeOff, X, Save, ArrowLeft, User, Mail, Phone, Ruler, Weight, Target, Calendar } from 'lucide-react';
import { registerTrainee } from '../lib/auth/trainee';
import { assets } from '../lib/config/assets';

interface TraineeRegistrationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TraineeRegistration({ onSuccess, onCancel }: TraineeRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    height: 170,
    weight: 70,
    targetWeight: 70,
    goals: [] as string[],
    plan: 'basic',
    age: 25,
    gender: 'male' as 'male' | 'female',
    bloodType: 'A+' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const plans = [
    { id: 'basic', name: 'الخطة الأساسية', price: 99, duration: 'شهر واحد', features: ['برنامج تدريبي أساسي', 'برنامج غذائي أساسي', 'متابعة أسبوعية'] },
    { id: 'premium', name: 'الخطة المتقدمة', price: 199, duration: '3 شهور', features: ['برنامج تدريبي متقدم', 'برنامج غذائي مخصص', 'متابعة يومية', 'جلسات خاصة'] },
    { id: 'pro', name: 'الخطة الاحترافية', price: 299, duration: '6 شهور', features: ['برنامج تدريبي احترافي', 'برنامج غذائي مخصص', 'متابعة مستمرة', 'جلسات خاصة', 'استشارات غير محدودة'] }
  ];

  const goals = [
    { id: 'weight_loss', name: 'خسارة الوزن', icon: '🎯' },
    { id: 'muscle_gain', name: 'زيادة العضلات', icon: '💪' },
    { id: 'fitness', name: 'اللياقة البدنية', icon: '🏃‍♂️' },
    { id: 'strength', name: 'القوة', icon: '🏋️‍♂️' },
    { id: 'flexibility', name: 'المرونة', icon: '🧘‍♂️' }
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }

    if (formData.goals.length === 0) {
      setError('يرجى اختيار هدف واحد على الأقل');
      return;
    }

    try {
      setLoading(true);
      
      const result = await registerTrainee(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.height,
        formData.weight,
        formData.targetWeight,
        formData.goals,
        formData.plan
      );
      
      if (!result.success) {
        throw new Error(result.error || 'حدث خطأ أثناء التسجيل');
      }
      
      setSuccess('تم تسجيل المتدرب بنجاح');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        height: 170,
        weight: 70,
        targetWeight: 70,
        goals: [],
        plan: 'basic',
        age: 25,
        gender: 'male',
        bloodType: 'A+'
      });
      
      // Notify parent component after a delay
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء التسجيل');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1A1F2E] w-full h-full max-w-full max-h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#0AE7F2]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onCancel}
              className="w-10 h-10 bg-[#0A0F1C] rounded-full flex items-center justify-center hover:bg-[#0A0F1C]/80 transition-colors"
            >
              <ArrowLeft size={20} className="text-[#0AE7F2]" />
            </button>
            <h2 className="text-2xl font-bold">إضافة متدرب جديد</h2>
          </div>
          <button 
            onClick={onCancel}
            className="w-10 h-10 bg-[#0A0F1C] rounded-full flex items-center justify-center hover:bg-[#0A0F1C]/80 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-4 rounded-xl text-center mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-[#0A0F1C]/40 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold mb-4 text-[#0AE7F2]">المعلومات الشخصية</h3>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">الاسم</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      minLength={8}
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
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">العمر</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                        className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                        required
                        min="12"
                        max="100"
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
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

                <div>
                  <label className="block text-sm text-gray-400 mb-1">فصيلة الدم</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as any })}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  >
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical Measurements */}
              <div className="bg-[#0A0F1C]/40 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold mb-4 text-[#0AE7F2]">القياسات الجسدية</h3>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">الطول (سم)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="100"
                      max="250"
                    />
                    <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">الوزن الحالي (كجم)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="30"
                      max="200"
                    />
                    <Weight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">الوزن المستهدف (كجم)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="30"
                      max="200"
                    />
                    <Target className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">الأهداف</label>
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
            </div>

            {/* Subscription Plan */}
            <div className="mt-8 bg-[#0A0F1C]/40 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-[#0AE7F2]">خطة الاشتراك</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <label
                    key={plan.id}
                    className={`block p-6 rounded-xl cursor-pointer transition-all ${
                      formData.plan === plan.id
                        ? 'bg-[#0AE7F2]/20 border-[#0AE7F2] text-white'
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
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold">{plan.name}</h4>
                        <p className="text-xl font-bold text-[#0AE7F2]">{plan.price} ₪</p>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">{plan.duration}</p>
                      <ul className="space-y-2 mt-auto">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-[#0AE7F2]">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>جاري التسجيل...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>تسجيل المتدرب</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}