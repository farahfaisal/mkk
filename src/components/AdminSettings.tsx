import React, { useState } from 'react';
import { Settings, Bell, Shield, Palette, Code, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('security');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tabs = [
    { id: 'endpoints', label: 'نقاط النهاية', icon: Code },
    { id: 'general', label: 'إعدادات عامة', icon: Settings },
    { id: 'security', label: 'إعدادات الأمان', icon: Shield },
    { id: 'notifications', label: 'إعدادات الإشعارات', icon: Bell },
    { id: 'appearance', label: 'إعدادات المظهر', icon: Palette }
  ];

  const endpoints = [
    {
      name: 'نظرة عامة',
      endpoint: '/admin-api/stats',
      methods: ['GET']
    },
    {
      name: 'المتدربين',
      endpoint: '/admin-api/trainees',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      name: 'التمارين',
      endpoint: '/admin-api/exercises',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      name: 'الوجبات',
      endpoint: '/admin-api/meals',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      name: 'المحادثات',
      endpoint: '/admin-api/chat',
      methods: ['GET', 'POST']
    },
    {
      name: 'الإشعارات',
      endpoint: '/admin-api/notifications',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      name: 'العضويات',
      endpoint: '/admin-api/memberships',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      name: 'الإعدادات العامة',
      endpoint: '/admin-api/settings/general',
      methods: ['GET', 'PUT']
    },
    {
      name: 'إعدادات الأمان',
      endpoint: '/admin-api/settings/security',
      methods: ['GET', 'PUT']
    },
    {
      name: 'إعدادات الإشعارات',
      endpoint: '/admin-api/settings/notifications',
      methods: ['GET', 'PUT']
    },
    {
      name: 'إعدادات المظهر',
      endpoint: '/admin-api/settings/appearance',
      methods: ['GET', 'PUT']
    }
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم وحرف خاص');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('update_admin_password', {
        admin_email: 'mk@powerhouse.com',
        current_password: currentPassword,
        new_password: newPassword
      });

      if (error) throw error;

      if (!data) {
        throw new Error('كلمة المرور الحالية غير صحيحة');
      }

      setSuccess('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('Error changing password:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'endpoints':
        return (
          <div className="space-y-6">
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl p-6 border border-[#0AE7F2]/20">
              <h3 className="text-lg font-bold mb-4">نقاط النهاية المتاحة</h3>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="bg-[#0A0F1C] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{endpoint.name}</h4>
                      <div className="flex gap-2">
                        {endpoint.methods.map(method => (
                          <span 
                            key={method}
                            className={`text-xs px-2 py-1 rounded ${
                              method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                              method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                              method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[#0AE7F2] text-sm font-mono">{endpoint.endpoint}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-6">
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl p-6 border border-[#0AE7F2]/20">
              <h3 className="text-lg font-bold mb-4">معلومات التطبيق</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">اسم التطبيق</label>
                  <input
                    type="text"
                    defaultValue="MK"
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">وصف التطبيق</label>
                  <textarea
                    defaultValue="منصة تدريب رياضي متكاملة"
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2] h-24 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl p-6 border border-[#0AE7F2]/20">
              <h3 className="text-lg font-bold mb-4">معلومات التواصل</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    defaultValue="contact@powerhouse.com"
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    defaultValue="+970 59 123 4567"
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl p-6 border border-[#0AE7F2]/20">
              <h3 className="text-lg font-bold mb-4">تغيير كلمة المرور</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-4 rounded-xl text-center">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-1">كلمة المرور الحالية</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري تغيير كلمة المرور...' : 'تغيير كلمة المرور'}
                </button>
              </form>
            </div>

            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl p-6 border border-[#0AE7F2]/20">
              <h3 className="text-lg font-bold mb-4">إعدادات الأمان الأخرى</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#0A0F1C] rounded-xl">
                  <div>
                    <h4 className="font-medium">المصادقة الثنائية</h4>
                    <p className="text-sm text-gray-400">تفعيل المصادقة الثنائية لحماية إضافية</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AE7F2]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A0F1C] rounded-xl">
                  <div>
                    <h4 className="font-medium">تأكيد البريد الإلكتروني</h4>
                    <p className="text-sm text-gray-400">طلب تأكيد البريد الإلكتروني عند التسجيل</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AE7F2]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl p-6 border border-[#0AE7F2]/20">
              <h3 className="text-lg font-bold mb-4">إعدادات الإشعارات</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#0A0F1C] rounded-xl">
                  <div>
                    <h4 className="font-medium">إشعارات البريد الإلكتروني</h4>
                    <p className="text-sm text-gray-400">إرسال إشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AE7F2]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0A0F1C] rounded-xl">
                  <div>
                    <h4 className="font-medium">إشعارات التطبيق</h4>
                    <p className="text-sm text-gray-400">إشعارات داخل التطبيق</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0AE7F2]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl p-6 border border-[#0AE7F2]/20">
              <h3 className="text-lg font-bold mb-4">إعدادات المظهر</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">المظهر</label>
                  <select className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]">
                    <option value="dark">داكن</option>
                    <option value="light">فاتح</option>
                    <option value="system">حسب النظام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">اللون الرئيسي</label>
                  <div className="grid grid-cols-5 gap-4">
                    {['#0AE7F2', '#F20A0A', '#0AF20A', '#F2A70A', '#A70AF2'].map((color) => (
                      <button
                        key={color}
                        className="w-full aspect-square rounded-xl border-2 border-transparent hover:border-white/20 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-[#0AE7F2] text-black'
                : 'bg-[#1A1F2E]/60 text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={20} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}