import React, { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Dumbbell, Percent, Droplets, Ruler, Scale, Settings, CreditCard, Calendar, CheckCircle, ChevronDown, User, Mail, Phone, Camera, Save, X, Lock, Bell, Palette, Eye, EyeOff, Heart, Grape as Tape } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/auth';
import { getUserMembership } from '../lib/api/memberships';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { formatDate } from '../lib/utils/date';
import { getTraineeProfile } from '../lib/auth/trainee';

export function UserProfile() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [membership, setMembership] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMembershipDetails, setShowMembershipDetails] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    height: 175,
    weight: 75,
    age: 30,
    goal: 'weight_loss',
    gender: 'male'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appNotifications: true,
    exerciseReminders: true,
    mealReminders: true,
    weightReminders: true
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    language: 'ar',
    fontSize: 'medium'
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    bloodType: 'A+',
    gender: 'male',
    currentWeight: 75,
    initialWeight: 85,
    targetWeight: 70,
    currentFat: 18,
    initialFat: 25,
    currentMuscle: 60,
    initialMuscle: 45,
    currentWaist: 85,
    initialWaist: 95,
    currentNeck: 38,
    initialNeck: 40,
    currentArm: 32,
    initialArm: 30,
    currentChest: 95,
    initialChest: 100,
    currentThigh: 55,
    initialThigh: 60,
    currentCalf: 38,
    initialCalf: 40,
    height: 175,
    age: 30
  });

  useEffect(() => {
    fetchUserData();
    fetchMembership();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (isSupabaseConnected()) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }
        
        // Get user profile
        const { data: profile, error } = await supabase
          .from('trainee_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (profile) {
          setUserData({
            ...userData,
            name: profile.name || '',
            email: profile.email || '',
            gender: profile.gender || 'male',
            currentWeight: profile.current_weight || 75,
            initialWeight: profile.initial_weight || 85,
            targetWeight: profile.target_weight || 70,
            currentFat: profile.fat_percentage || 18,
            initialFat: profile.fat_percentage || 25,
            currentMuscle: profile.muscle_mass || 60,
            initialMuscle: profile.muscle_mass || 45,
            currentWaist: profile.waist_circumference || 85,
            initialWaist: profile.waist_circumference || 95,
            currentNeck: profile.neck_circumference || 38,
            initialNeck: profile.neck_circumference || 40,
            currentArm: profile.arm_circumference || 32,
            initialArm: profile.arm_circumference || 30,
            currentChest: profile.chest_circumference || 95,
            initialChest: profile.chest_circumference || 100,
            currentThigh: profile.thigh_circumference || 55,
            initialThigh: profile.thigh_circumference || 60,
            currentCalf: profile.calf_circumference || 38,
            initialCalf: profile.calf_circumference || 40,
            height: profile.height || 175,
            age: profile.age || 30
          });
          
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            height: profile.height || 175,
            weight: profile.current_weight || 75,
            age: profile.age || 30,
            goal: profile.goal?.[0] || 'weight_loss',
            gender: profile.gender || 'male'
          });
        }
      } else {
        // Try to get user data from localStorage first
        const storedProfile = localStorage.getItem('traineeProfile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setUserData({
            ...userData,
            name: profile.name || '',
            email: profile.email || '',
            gender: profile.gender || 'male',
            currentWeight: profile.weight || 75,
            targetWeight: profile.targetWeight || 70,
            height: profile.height || 175,
            age: profile.age || 30
          });
          
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            height: profile.height || 175,
            weight: profile.weight || 75,
            age: profile.age || 30,
            goal: profile.goals?.[0] || 'weight_loss',
            gender: profile.gender || 'male'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembership = async () => {
    try {
      setLoading(true);
      
      // Get trainee ID from localStorage
      const traineeId = localStorage.getItem('traineeId');
      
      // Get membership data
      const membershipData = await getUserMembership(traineeId || undefined);
      setMembership(membershipData);
    } catch (error) {
      console.error('Error fetching membership:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/trainee');
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled in the logout function
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const calculateKg = (percentage: number, weight: number) =>
    ((percentage / 100) * weight).toFixed(1);

  const calculateDiff = (currPercent: number, currWeight: number, prevPercent: number, prevWeight: number) => {
    const currentKg = (currPercent / 100) * currWeight;
    const previousKg = (prevPercent / 100) * prevWeight;
    return (currentKg - previousKg).toFixed(1);
  };

  const getMembershipColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'bg-gradient-to-r from-[#0AE7F2] to-[#0A84E7]';
      case 'pro':
        return 'bg-gradient-to-r from-[#E7A70A] to-[#E74A0A]';
      default:
        return 'bg-gradient-to-r from-[#0AE7F2]/70 to-[#0A84E7]/70';
    }
  };

  const getMembershipNameArabic = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'الخطة المتقدمة';
      case 'pro':
        return 'الخطة الاحترافية';
      default:
        return 'الخطة الأساسية';
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaveError(null);
      
      if (isSupabaseConnected()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }
        
        // Update profile in database
        const { error } = await supabase
          .from('trainee_profiles')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            height: formData.height,
            current_weight: formData.weight,
            goal: [formData.goal],
            gender: formData.gender,
            age: formData.age
          })
          .eq('id', user.id);
          
        if (error) throw error;
        
        // Update user data state
        setUserData({
          ...userData,
          name: formData.name,
          email: formData.email,
          gender: formData.gender,
          currentWeight: formData.weight,
          height: formData.height,
          age: formData.age
        });
        
        // Update localStorage
        const storedProfile = localStorage.getItem('traineeProfile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          const updatedProfile = {
            ...profile,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            height: formData.height,
            weight: formData.weight,
            goals: [formData.goal],
            gender: formData.gender,
            age: formData.age
          };
          localStorage.setItem('traineeProfile', JSON.stringify(updatedProfile));
        }
      }
      
      setSaveSuccess('تم حفظ التغييرات بنجاح');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError('حدث خطأ أثناء حفظ التغييرات');
      setSaveSuccess(null);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveError('كلمات المرور غير متطابقة');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setSaveError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    try {
      setSaveError(null);
      
      if (isSupabaseConnected()) {
        // Update password using Supabase Auth
        const { error } = await supabase.auth.updateUser({
          password: passwordData.newPassword
        });
        
        if (error) throw error;
      }
      
      setSaveSuccess('تم تغيير كلمة المرور بنجاح');
      setShowPasswordForm(false);
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setSaveError('حدث خطأ أثناء تغيير كلمة المرور');
      setSaveSuccess(null);
    }
  };

  const handleSaveNotifications = () => {
    // Here you would normally save to the database
    setSaveSuccess('تم حفظ إعدادات الإشعارات بنجاح');
    setSaveError(null);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };

  const handleSaveAppearance = () => {
    // Here you would normally save to the database
    setSaveSuccess('تم حفظ إعدادات المظهر بنجاح');
    setSaveError(null);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };

  // Render settings content based on active tab
  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case 'profile':
        return (
          <div className="space-y-4">
            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-[#0A0F1C] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#0AE7F2]">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[#0AE7F2] text-4xl font-bold">
                      {formData.name.charAt(0)}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-[#0AE7F2] p-2 rounded-full cursor-pointer"
                >
                  <Camera size={16} className="text-black" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">الاسم</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
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
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">الطول (سم)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">الوزن (كجم)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">العمر</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">الجنس</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
                <option value="other">آخر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">الهدف</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              >
                <option value="weight_loss">خسارة الوزن</option>
                <option value="muscle_gain">زيادة الكتلة العضلية</option>
                <option value="maintain">المحافظة على الوزن</option>
                <option value="fitness">تحسين اللياقة البدنية</option>
              </select>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Save size={20} />
              <span>حفظ التغييرات</span>
            </button>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">كلمة المرور</h3>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-[#0AE7F2] text-sm hover:underline"
                >
                  {showPasswordForm ? 'إلغاء' : 'تغيير'}
                </button>
              </div>

              {showPasswordForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">كلمة المرور الحالية</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
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
                    <label className="block text-sm text-gray-400 mb-1">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="flex-1 py-2 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handlePasswordChange}
                      className="flex-1 py-2 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  كلمة المرور الخاصة بك آمنة. يمكنك تغييرها في أي وقت.
                </p>
              )}
            </div>

            <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">المصادقة الثنائية</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    تفعيل المصادقة الثنائية لحماية إضافية
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AE7F2]"></div>
                </label>
              </div>
            </div>

            <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">تأكيد البريد الإلكتروني</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    طلب تأكيد البريد الإلكتروني عند تغييره
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AE7F2]"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">إشعارات البريد الإلكتروني</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    إرسال إشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.target.checked
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AE7F2]"></div>
                </label>
              </div>
            </div>

            <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">إشعارات التطبيق</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    إشعارات داخل التطبيق
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationSettings.appNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      appNotifications: e.target.checked
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AE7F2]"></div>
                </label>
              </div>
            </div>

            <button
              onClick={handleSaveNotifications}
              className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Save size={20} />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">المظهر</label>
              <select
                value={appearanceSettings.theme}
                onChange={(e) => setAppearanceSettings({ ...appearanceSettings, theme: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              >
                <option value="dark">داكن</option>
                <option value="light">فاتح</option>
                <option value="system">حسب النظام</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">اللغة</label>
              <select
                value={appearanceSettings.language}
                onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">حجم الخط</label>
              <select
                value={appearanceSettings.fontSize}
                onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              >
                <option value="small">صغير</option>
                <option value="medium">متوسط</option>
                <option value="large">كبير</option>
              </select>
            </div>

            <button
              onClick={handleSaveAppearance}
              className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Save size={20} />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handleBack} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">الصفحة الشخصية</h1>
        <button onClick={() => setShowSettings(!showSettings)} className="text-white hover:text-[#0AE7F2]">
          <Settings size={24} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#0AE7F2]/20 flex items-center justify-between">
              <h2 className="text-xl font-bold">الإعدادات</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="mx-6 mt-4 bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-3 rounded-xl text-center">
                {saveSuccess}
              </div>
            )}
            
            {saveError && (
              <div className="mx-6 mt-4 bg-rose-500/10 border border-rose-500 text-rose-500 p-3 rounded-xl text-center">
                {saveError}
              </div>
            )}

            {/* Tabs */}
            <div className="flex p-4 gap-2 border-b border-[#0AE7F2]/10">
              <button
                onClick={() => setActiveSettingsTab('profile')}
                className={`flex-1 py-2 rounded-xl transition-colors ${
                  activeSettingsTab === 'profile'
                    ? 'bg-[#0AE7F2] text-black'
                    : 'bg-[#0A0F1C]/40 text-gray-400 hover:text-white'
                }`}
              >
                الملف الشخصي
              </button>
              <button
                onClick={() => setActiveSettingsTab('security')}
                className={`flex-1 py-2 rounded-xl transition-colors ${
                  activeSettingsTab === 'security'
                    ? 'bg-[#0AE7F2] text-black'
                    : 'bg-[#0A0F1C]/40 text-gray-400 hover:text-white'
                }`}
              >
                الأمان
              </button>
              <button
                onClick={() => setActiveSettingsTab('notifications')}
                className={`flex-1 py-2 rounded-xl transition-colors ${
                  activeSettingsTab === 'notifications'
                    ? 'bg-[#0AE7F2] text-black'
                    : 'bg-[#0A0F1C]/40 text-gray-400 hover:text-white'
                }`}
              >
                الإشعارات
              </button>
              <button
                onClick={() => setActiveSettingsTab('appearance')}
                className={`flex-1 py-2 rounded-xl transition-colors ${
                  activeSettingsTab === 'appearance'
                    ? 'bg-[#0AE7F2] text-black'
                    : 'bg-[#0A0F1C]/40 text-gray-400 hover:text-white'
                }`}
              >
                المظهر
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {renderSettingsContent()}
            </div>
          </div>
        </div>
      )}

      {/* Profile */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-[#0AE7F2] mb-2 overflow-hidden">
          {photoPreview ? (
            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#1A1F2E] flex items-center justify-center">
              <span className="text-[#0AE7F2] text-2xl font-bold">
                {userData.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <h2 className="text-lg font-bold">{userData.name}</h2>
        <p className="text-sm text-gray-400">{userData.email}</p>
        <div className="mt-2 flex items-center gap-2 bg-[#1A1F2E]/40 px-3 py-1 rounded-full">
          <Heart size={14} className="text-[#0AE7F2]" />
          <span className="text-sm text-[#0AE7F2]">{userData.gender === 'male' ? 'ذكر' : userData.gender === 'female' ? 'أنثى' : 'آخر'}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 overflow-y-auto">
        {/* Basic Information */}
        <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Ruler size={18} className="text-[#0AE7F2]" />
            <h3 className="text-sm font-bold text-[#0AE7F2]">المعلومات الأساسية</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">الطول</p>
              <p className="text-lg font-bold">{userData.height} سم</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">العمر</p>
              <p className="text-lg font-bold">{userData.age} سنة</p>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Scale size={18} className="text-[#0AE7F2]" />
            <h3 className="text-sm font-bold text-[#0AE7F2]">الوزن</h3>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-xs text-gray-400">الحالي</p>
              <p className="text-lg font-bold">{userData.currentWeight} كغ</p>
            </div>
            <div className="text-[#0AE7F2]">←</div>
            <div className="text-center">
              <p className="text-xs text-gray-400">السابق</p>
              <p className="text-lg font-bold">{userData.initialWeight} كغ</p>
            </div>
          </div>
          <p className="text-center text-xs text-yellow-400 mt-2">
            الفرق: {userData.initialWeight - userData.currentWeight} كغ
          </p>
        </div>

        {/* Body Fat */}
        <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Percent size={18} className="text-[#0AE7F2]" />
            <h3 className="text-sm font-bold text-[#0AE7F2]">نسبة الدهون</h3>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-xs text-gray-400">الحالي</p>
              <p className="text-lg font-bold">{userData.currentFat}%</p>
              <p className="text-xs text-gray-400 mt-1">
                {calculateKg(userData.currentFat, userData.currentWeight)} كغ
              </p>
            </div>
            <div className="text-[#0AE7F2]">←</div>
            <div className="text-center">
              <p className="text-xs text-gray-400">السابق</p>
              <p className="text-lg font-bold">{userData.initialFat}%</p>
              <p className="text-xs text-gray-400 mt-1">
                {calculateKg(userData.initialFat, userData.initialWeight)} كغ
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-yellow-400 mt-2">
            الفرق: {calculateDiff(userData.currentFat, userData.currentWeight, userData.initialFat, userData.initialWeight)} كغ
          </p>
        </div>

        {/* Muscle Mass */}
        <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <Dumbbell size={18} className="text-[#0AE7F2]" />
            <h3 className="text-sm font-bold text-[#0AE7F2]">الكتلة العضلية</h3>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-xs text-gray-400">الحالي</p>
              <p className="text-lg font-bold">{userData.currentMuscle}%</p>
              <p className="text-xs text-gray-400 mt-1">
                {calculateKg(userData.currentMuscle, userData.currentWeight)} كغ
              </p>
            </div>
            <div className="text-[#0AE7F2]">←</div>
            <div className="text-center">
              <p className="text-xs text-gray-400">السابق</p>
              <p className="text-lg font-bold">{userData.initialMuscle}%</p>
              <p className="text-xs text-gray-400 mt-1">
                {calculateKg(userData.initialMuscle, userData.initialWeight)} كغ
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-yellow-400 mt-2">
            الفرق: {calculateDiff(userData.currentMuscle, userData.currentWeight, userData.initialMuscle, userData.initialWeight)} كغ
          </p>
        </div>

        {/* Body Measurements */}
        <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <Tape size={18} className="text-[#0AE7F2]" />
            <h3 className="text-sm font-bold text-[#0AE7F2]">قياسات الجسم (سم)</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Waist */}
            <div className="bg-[#0A0F1C]/40 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">محيط الخصر</p>
              <div className="flex justify-between">
                <span className="text-sm">الحالي: <span className="text-[#0AE7F2]">{userData.currentWaist}</span></span>
                <span className="text-sm">السابق: <span className="text-gray-400">{userData.initialWaist}</span></span>
              </div>
              <p className="text-xs text-yellow-400 mt-1">
                الفرق: {userData.initialWaist - userData.currentWaist}
              </p>
            </div>
            
            {/* Chest */}
            <div className="bg-[#0A0F1C]/40 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">محيط الصدر</p>
              <div className="flex justify-between">
                <span className="text-sm">الحالي: <span className="text-[#0AE7F2]">{userData.currentChest}</span></span>
                <span className="text-sm">السابق: <span className="text-gray-400">{userData.initialChest}</span></span>
              </div>
              <p className="text-xs text-yellow-400 mt-1">
                الفرق: {userData.initialChest - userData.currentChest}
              </p>
            </div>
            
            {/* Neck */}
            <div className="bg-[#0A0F1C]/40 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">محيط الرقبة</p>
              <div className="flex justify-between">
                <span className="text-sm">الحالي: <span className="text-[#0AE7F2]">{userData.currentNeck}</span></span>
                <span className="text-sm">السابق: <span className="text-gray-400">{userData.initialNeck}</span></span>
              </div>
              <p className="text-xs text-yellow-400 mt-1">
                الفرق: {userData.initialNeck - userData.currentNeck}
              </p>
            </div>
            
            {/* Arm */}
            <div className="bg-[#0A0F1C]/40 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">محيط الذراع</p>
              <div className="flex justify-between">
                <span className="text-sm">الحالي: <span className="text-[#0AE7F2]">{userData.currentArm}</span></span>
                <span className="text-sm">السابق: <span className="text-gray-400">{userData.initialArm}</span></span>
              </div>
              <p className="text-xs text-yellow-400 mt-1">
                الفرق: {userData.initialArm - userData.currentArm}
              </p>
            </div>
            
            {/* Thigh */}
            <div className="bg-[#0A0F1C]/40 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">محيط الفخذ</p>
              <div className="flex justify-between">
                <span className="text-sm">الحالي: <span className="text-[#0AE7F2]">{userData.currentThigh}</span></span>
                <span className="text-sm">السابق: <span className="text-gray-400">{userData.initialThigh}</span></span>
              </div>
              <p className="text-xs text-yellow-400 mt-1">
                الفرق: {userData.initialThigh - userData.currentThigh}
              </p>
            </div>
            
            {/* Calf */}
            <div className="bg-[#0A0F1C]/40 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">محيط الساق</p>
              <div className="flex justify-between">
                <span className="text-sm">الحالي: <span className="text-[#0AE7F2]">{userData.currentCalf}</span></span>
                <span className="text-sm">السابق: <span className="text-gray-400">{userData.initialCalf}</span></span>
              </div>
              <p className="text-xs text-yellow-400 mt-1">
                الفرق: {userData.initialCalf - userData.currentCalf}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 mt-6"
      >
        <LogOut size={16} />
        <span className="text-sm">تسجيل الخروج</span>
      </button>
    </div>
  );
}