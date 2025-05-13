import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart2,
  Calendar,
  Settings,
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
  Clock
} from 'lucide-react';

interface NewAdminDashboardProps {
  onBack: () => void;
}

export function NewAdminDashboard({ onBack }: NewAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'settings'>('overview');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavigation = (route: string) => {
    switch (route) {
      case 'notifications':
        window.history.pushState({}, '', '/admin-notifications');
        window.location.reload();
        break;
      default:
        break;
    }
  };

  // Mock data
  const stats = {
    totalUsers: 1250,
    activeUsers: 856,
    totalRevenue: 15600,
    newSubscriptions: 28
  };

  const recentUsers = [
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      plan: 'الخطة المتقدمة',
      status: 'active',
      joinDate: '2024-03-15'
    },
    {
      id: '2',
      name: 'سارة علي',
      email: 'sara@example.com',
      plan: 'الخطة الأساسية',
      status: 'pending',
      joinDate: '2024-03-14'
    },
    {
      id: '3',
      name: 'محمد خالد',
      email: 'mohamed@example.com',
      plan: 'الخطة المتوسطة',
      status: 'inactive',
      joinDate: '2024-03-13'
    }
  ];

  const activities = [
    {
      id: '1',
      user: 'أحمد محمد',
      action: 'اشترك في الخطة المتقدمة',
      time: 'منذ 5 دقائق'
    },
    {
      id: '2',
      user: 'سارة علي',
      action: 'أكملت التمرين اليومي',
      time: 'منذ 15 دقيقة'
    },
    {
      id: '3',
      user: 'محمد خالد',
      action: 'حدث بيانات الحساب',
      time: 'منذ ساعة'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'pending':
        return 'text-amber-500 bg-amber-500/10';
      case 'inactive':
        return 'text-rose-500 bg-rose-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0F1C] text-white">
      {/* Background with Gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2E] to-[#0A0F1C]" />

      <div className="relative z-10">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 bg-[#1A1F2E]/80 backdrop-blur-lg border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={onBack} className="text-white/80 hover:text-white transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">لوحة التحكم</h1>
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={() => handleNavigation('notifications')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Bell size={20} />
                </button>
                <button className="text-white/80 hover:text-white transition-colors">
                  <Settings size={20} />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:bg-white/5 rounded-full py-1 px-2 transition-colors"
                  >
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                    <ChevronDown size={16} className="text-white/60" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-[#1A1F2E] rounded-xl border border-white/10 shadow-xl">
                      <div className="p-2">
                        <button className="w-full text-right px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors">
                          الملف الشخصي
                        </button>
                        <button className="w-full text-right px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors">
                          الإعدادات
                        </button>
                        <hr className="my-2 border-white/10" />
                        <button className="w-full text-right px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-1 mt-4">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                نظرة عامة
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'users' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                المستخدمين
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'reports' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                التقارير
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                الإعدادات
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <p className="text-2xl font-bold">${stats.totalRevenue}</p>
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
          </div>

          {/* Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-[#1A1F2E] rounded-xl border border-white/10">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">المستخدمون الجدد</h2>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <Filter size={16} className="text-white/60" />
                      </button>
                      <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2">
                        <Plus size={16} />
                        <span>إضافة مستخدم</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-5 h-5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="البحث عن مستخدم..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-right py-3 px-6 text-sm font-medium text-white/60">المستخدم</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الخطة</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الحالة</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-white/60">تاريخ الانضمام</th>
                        <th className="text-right py-3 px-6 text-sm font-medium text-white/60"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b border-white/10 last:border-0">
                          <td className="py-3 px-6">
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-white/60">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span className="text-sm">{user.plan}</span>
                          </td>
                          <td className="py-3 px-6">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {getStatusIcon(user.status)}
                              <span>
                                {user.status === 'active' ? 'نشط' : 
                                 user.status === 'pending' ? 'معلق' : 'غير نشط'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-6">
                            <span className="text-sm text-white/60">{user.joinDate}</span>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-1 hover:bg-white/5 rounded transition-colors">
                                <Edit2 size={16} className="text-white/60" />
                              </button>
                              <button className="p-1 hover:bg-white/5 rounded transition-colors">
                                <Trash2 size={16} className="text-white/60" />
                              </button>
                              <button className="p-1 hover:bg-white/5 rounded transition-colors">
                                <MoreVertical size={16} className="text-white/60" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-bold mb-6">النشاط الحديث</h2>
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-white/60">{activity.action}</p>
                      <p className="text-xs text-white/40 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}