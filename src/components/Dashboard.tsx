import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTraineeProfile } from '../lib/auth/trainee';
import { assets } from '../lib/config/assets';
import { BottomNav } from './BottomNav';
import { DashboardPerformance } from './DashboardPerformance';
import { AnimatedLogo } from './AnimatedLogo';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { Bell, Menu, X, Heart, LogOut, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export function Dashboard() {
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [genderSymbol, setGenderSymbol] = useState('⚦');

  useEffect(() => {
    (async () => {
      try {
        const profile = await getTraineeProfile();
        setUserName(profile?.name || '');
        setGenderSymbol(profile?.gender === 'male' ? '♂' : profile?.gender === 'female' ? '♀' : '⚦');
        fetchUnreadNotifications();
      } catch (err) {
        console.error('Failed to fetch trainee profile:', err);
      }
    })();
  }, []);

  const fetchUnreadNotifications = async () => {
    if (isSupabaseConnected()) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { count } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
          .is('read_at', null);
        setUnreadNotifications(count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
  };

  const handleNavigation = (route: string) => {
    const paths: Record<string, string> = {
      diet: '/trainee/diet',
      weight: '/trainee/weight',
      exercise: '/trainee/exercise',
      profile: '/trainee/profile',
      settings: '/trainee/profile/settings'
    };
    if (paths[route]) navigate(paths[route]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/trainee/login');
  };

  return (
    <div dir="rtl" className="min-h-[100dvh] max-h-[100dvh] bg-[#0A0F1C] text-white flex flex-col relative overflow-hidden">
      {/* الخلفية */}
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url("${assets.backgrounds.main}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }} />

      {/* التذليل السفلي */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0F1C] to-transparent z-10 pointer-events-none" />

      {/* الشريط الجانبي */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed top-0 right-0 h-full w-64 bg-[#1A1F2E]/95 backdrop-blur-lg z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#0AE7F2]/20 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-full hover:bg-[#0AE7F2]/10">
              <X size={24} className="text-[#0AE7F2]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center">
                <Heart size={20} className="text-[#0AE7F2]" />
              </div>
              <div className="text-right">
                <h3 className="font-bold text-white">{userName}</h3>
                <div className="text-[#0AE7F2] text-sm">
                  {genderSymbol === '♂' ? 'ذكر' : genderSymbol === '♀' ? 'أنثى' : 'آخر'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <button onClick={() => handleNavigation('settings')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#0AE7F2]/10 text-white">
              <Settings size={20} className="text-[#0AE7F2]" />
              <span>الإعدادات</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-rose-600/10 text-rose-500">
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-grow flex flex-col justify-between px-4 pb-24 pt-2 z-20">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between w-full">
          <button onClick={() => setSidebarOpen(true)} aria-label="القائمة">
            <Menu className="w-6 h-6 text-white" />
          </button>

          <AnimatedLogo
            src="https://souqpale.com/wp-content/uploads/2025/03/تصميم-بدون-عنوان-9.png"
            alt="Logo"
            width={120}
            height={120}
          />

          <button onClick={() => navigate('/trainee/notifications')} aria-label="الإشعارات" className="relative">
            <Bell className="w-6 h-6 text-white" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* الترحيب */}
        <motion.div
          initial={{ opacity: 0, y: 1 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold text-[#0AE7F2] mt-1 mb-3 text-center"
        >
          {userName ? `مرحباً بك ${genderSymbol} ${userName}` : 'مرحباً بك في تطبيق MK'}
        </motion.div>

        {/* البطاقات في منتصف الشاشة */}
        <div className="flex-grow flex items-center justify-center">
          <div className="grid grid-cols-2 gap-x-14 gap-y-5">
            {[
              { label: 'وزنك الصباحي', icon: assets.icons.weightScale, route: 'weight' },
              { label: 'برنامجك الغذائي', icon: assets.icons.foodProgram, route: 'diet' },
              { label: 'صفحة حسابك', icon: assets.icons.profile, route: 'profile' },
              { label: 'برنامج تمارينك', icon: assets.icons.exerciseProgram, route: 'exercise' },
            ].map(({ label, icon, route }) => (
              <button
                key={route}
                onClick={() => handleNavigation(route)}
                className="relative w-[110px] h-[110px] md:w-[130px] md:h-[130px] flex flex-col items-center justify-center group hover:scale-105 transition"
                aria-label={label}
              >
                <div className="absolute inset-0 bg-black/50 rounded-[20px] border-[2px] border-[#0ae7f2]" />
                <img src={icon} alt={label} className="relative w-12 h-12 object-contain mb-2" />
                <span className="relative text-sm font-medium text-[#0AE7F2] text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* مخطط الأداء + هامش أمان */}
        <div className="w-full mt-4">
          <DashboardPerformance />
          <div className="h-24 md:h-32 lg:h-40" />
        </div>
      </div>

      {/* شريط التنقل السفلي */}
      <BottomNav className="fixed bottom-0 left-0 w-full z-50" />
    </div>
  );
}
