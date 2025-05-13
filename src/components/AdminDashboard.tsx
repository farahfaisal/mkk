import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart2,
  Calendar,
  Search,
  Bell,
  Menu,
  User,
  ChevronDown,
  Plus,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Code,
  Settings,
  Loader2,
  Apple,
  Dumbbell,
  Footprints
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminTraineesTable } from './AdminTraineesTable';
import { AdminExercises } from './AdminExercises';
import { AdminMeals } from './AdminMeals';
import { AdminMemberships } from './AdminMemberships';
import { AdminSettings } from './AdminSettings';
import { TraineeStepsTable } from './TraineeStepsTable';
import { getAdminStats } from '../lib/api/admin';
import { initializeSupabase, isSupabaseConnected } from '../lib/supabase';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [showEndpoint, setShowEndpoint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    newSubscriptions: 0,
    subscriptionDistribution: {
      basic: 0,
      premium: 0,
      pro: 0
    },
    statusDistribution: {
      active: 0,
      pending: 0,
      inactive: 0
    },
    averageWeight: 0,
    averageProgress: 0,
    totalMeals: 0,
    totalExercises: 0
  });

  useEffect(() => {
    if (activeSection === 'overview') {
      loadStats();
    }
  }, [activeSection]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize Supabase connection
      await initializeSupabase();

      // Get stats (will return mock data if not connected)
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { 
      id: 'overview', 
      icon: Users, 
      label: 'نظرة عامة',
      endpoint: '/admin-api/stats',
      methods: ['GET']
    },
    { 
      id: 'trainees', 
      icon: Users, 
      label: 'المتدربين',
      endpoint: '/admin-api/trainees',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    { 
      id: 'exercises', 
      icon: BarChart2, 
      label: 'التمارين',
      endpoint: '/admin-api/exercises',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    { 
      id: 'meals', 
      icon: Calendar, 
      label: 'الوجبات',
      endpoint: '/admin-api/meals',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    { 
      id: 'steps', 
      icon: Footprints, 
      label: 'الخطوات',
      endpoint: '/admin-api/steps',
      methods: ['GET', 'PUT']
    },
    { 
      id: 'chat', 
      icon: MessageCircle, 
      label: 'المحادثات',
      endpoint: '/admin-api/chat',
      methods: ['GET', 'POST']
    },
    { 
      id: 'notifications', 
      icon: Bell, 
      label: 'الإشعارات',
      endpoint: '/admin-api/notifications',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    { 
      id: 'memberships', 
      icon: DollarSign, 
      label: 'العضويات',
      endpoint: '/admin-api/memberships',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'إعدادات التطبيق',
      endpoint: '/admin-api/settings',
      methods: ['GET', 'PUT'],
      subEndpoints: [
        {
          label: 'إعدادات عامة',
          endpoint: '/admin-api/settings/general',
          methods: ['GET', 'PUT']
        },
        {
          label: 'إعدادات الأمان',
          endpoint: '/admin-api/settings/security',
          methods: ['GET', 'PUT']
        },
        {
          label: 'إعدادات الإشعارات',
          endpoint: '/admin-api/settings/notifications',
          methods: ['GET', 'PUT']
        },
        {
          label: 'إعدادات المظهر',
          endpoint: '/admin-api/settings/appearance',
          methods: ['GET', 'PUT']
        }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('userType');
    window.location.href = '/admin/login';
  };

  const handleNavigation = (route: string) => {
    switch (route) {
      case 'chat':
        navigate('/admin/chat');
        break;
      case 'notifications':
        navigate('/admin/notifications');
        break;
      default:
        setActiveSection(route);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {loading ? (
                <div className="col-span-4 flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 text-[#0AE7F2] animate-spin" />
                    <span className="text-gray-400">جاري تحميل البيانات...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="col-span-4 bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
                  {error}
                  <button 
                    onClick={loadStats}
                    className="underline hover:no-underline mt-2 block w-full"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-emerald-500/10 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-emerald-500" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-sm text-white/60 mb-1">إجمالي المستخدمين</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>

                  <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-500/10 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-blue-500" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-white/60 mb-1">المستخدمين النشطين</p>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  </div>

                  <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-amber-500/10 p-3 rounded-xl">
                        <DollarSign className="w-6 h-6 text-amber-500" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-sm text-white/60 mb-1">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold">₪{stats.totalRevenue}</p>
                  </div>

                  <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-500/10 p-3 rounded-xl">
                        <Users className="w-6 h-6 text-purple-500" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-sm text-white/60 mb-1">اشتراكات جديدة</p>
                    <p className="text-2xl font-bold">{stats.newSubscriptions}</p>
                  </div>
                </>
              )}
            </div>

            {/* Additional Stats for Meals and Exercises */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-500/10 p-3 rounded-xl">
                      <Apple className="w-6 h-6 text-green-500" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-white/60 mb-1">إجمالي الوجبات</p>
                  <p className="text-2xl font-bold">{stats.totalMeals}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">نسبة الاكتمال</span>
                      <span className="text-green-400">85%</span>
                    </div>
                    <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-500/10 p-3 rounded-xl">
                      <Dumbbell className="w-6 h-6 text-orange-500" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-sm text-white/60 mb-1">إجمالي التمارين</p>
                  <p className="text-2xl font-bold">{stats.totalExercises}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">نسبة الاكتمال</span>
                      <span className="text-orange-400">70%</span>
                    </div>
                    <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-[#0AE7F2]/10 p-3 rounded-xl">
                      <Footprints className="w-6 h-6 text-[#0AE7F2]" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-[#0AE7F2]" />
                  </div>
                  <p className="text-sm text-white/60 mb-1">متوسط الخطوات اليومية</p>
                  <p className="text-2xl font-bold">5,432</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">نسبة الإنجاز</span>
                      <span className="text-[#0AE7F2]">65%</span>
                    </div>
                    <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0AE7F2] rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Distribution Charts */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-bold mb-4">توزيع الوجبات حسب الفئة</h3>
                  <div className="flex justify-between items-center">
                    <div className="space-y-3 w-full">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">فطور</span>
                          <span className="text-[#0AE7F2]">45%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0AE7F2] rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">غداء</span>
                          <span className="text-green-400">30%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">عشاء</span>
                          <span className="text-purple-400">15%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">وجبة خفيفة</span>
                          <span className="text-amber-400">10%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg font-bold mb-4">توزيع التمارين حسب الفئة</h3>
                  <div className="flex justify-between items-center">
                    <div className="space-y-3 w-full">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">صدر</span>
                          <span className="text-[#0AE7F2]">25%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0AE7F2] rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">ظهر</span>
                          <span className="text-green-400">20%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">أرجل</span>
                          <span className="text-purple-400">20%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">كتف</span>
                          <span className="text-amber-400">15%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">أخرى</span>
                          <span className="text-rose-400">20%</span>
                        </div>
                        <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'trainees':
        return <AdminTraineesTable />;
      case 'exercises':
        return <AdminExercises />;
      case 'meals':
        return <AdminMeals />;
      case 'steps':
        return <TraineeStepsTable onBack={() => {}} />;
      case 'memberships':
        return <AdminMemberships />;
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0F1C] text-white">
      {/* Background with Gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2E] to-[#0A0F1C]" />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-64 bg-[#1A1F2E]/80 backdrop-blur-lg border-l border-white/10 transition-transform duration-300 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold text-[#0AE7F2]">MK</h1>
            <p className="text-sm text-gray-400">لوحة تحكم المدير</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavigation(item.id)}
                    onMouseEnter={() => setShowEndpoint(item.id)}
                    onMouseLeave={() => setShowEndpoint(null)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeSection === item.id
                        ? 'bg-[#0AE7F2] text-black'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                    <Code 
                      size={16} 
                      className={`mr-auto transition-opacity ${showEndpoint === item.id ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </button>
                  
                  {/* Endpoint Tooltip */}
                  {showEndpoint === item.id && (
                    <div className="absolute left-full top-0 ml-2 p-3 bg-[#1A1F2E] rounded-lg border border-[#0AE7F2]/20 shadow-xl z-50 whitespace-nowrap">
                      <div className="mb-2">
                        <p className="text-[#0AE7F2] text-sm font-mono mb-1">{item.endpoint}</p>
                        <div className="flex gap-2">
                          {item.methods.map(method => (
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

                      {/* Sub-endpoints */}
                      {item.subEndpoints && (
                        <div className="mt-3 pt-3 border-t border-[#0AE7F2]/10">
                          <p className="text-sm text-gray-400 mb-2">نقاط النهاية الفرعية:</p>
                          {item.subEndpoints.map((subEndpoint, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <p className="text-[#0AE7F2] text-xs font-mono mb-1">{subEndpoint.endpoint}</p>
                              <div className="flex gap-2">
                                {subEndpoint.methods.map(method => (
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
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${showSidebar ? 'mr-64' : ''}`}>
          {/* Top Bar */}
          <div className="sticky top-0 z-50 bg-[#1A1F2E]/80 backdrop-blur-lg border-b border-white/10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Menu size={24} />
                  </button>
                  <button onClick={onBack} className="text-white/80 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => navigate('/admin/notifications')}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Bell size={20} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 hover:bg-white/5 rounded-full py-1 px-2 transition-colors"
                    >
                      <div className="w-8 h-8 bg-[#0AE7F2] rounded-full flex items-center justify-center">
                        <User size={16} className="text-black" />
                      </div>
                      <ChevronDown size={16} className="text-white/60" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute left-0 mt-2 w-48 bg-[#1A1F2E] rounded-xl border border-white/10 shadow-xl">
                        <div className="p-2">
                          <button className="w-full text-right px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors">
                            الملف الشخصي
                          </button>
                          <hr className="my-2 border-white/10" />
                          <button 
                            onClick={handleLogout}
                            className="w-full text-right px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            تسجيل الخروج
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}