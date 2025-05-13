import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle, Clock, Trash2, MoreVertical, RefreshCw, Send, User, Users, Info, X, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, deleteNotification, sendNotification } from '../lib/api/notifications';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { formatRelativeTime } from '../lib/utils/date';

interface AdminNotificationsProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'exercise' | 'meal' | 'weight' | 'subscription';
  read: boolean;
}

interface Trainee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function AdminNotifications({ onBack }: AdminNotificationsProps) {
  const navigate = useNavigate();
  const [showNewNotification, setShowNewNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'all' | 'specific'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [notificationMessageType, setNotificationMessageType] = useState<'info' | 'success' | 'warning' | 'error' | 'exercise' | 'meal' | 'weight' | 'subscription'>('info');

  useEffect(() => {
    fetchNotifications();
    if (notificationType === 'specific') {
      fetchTrainees();
    }
  }, [notificationType]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        // Get notifications from Supabase
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Format notifications
        const formattedNotifications = data.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          timestamp: new Date(notification.created_at),
          type: notification.type as Notification['type'],
          read: !!notification.read_at
        }));
        
        setNotifications(formattedNotifications);
      } else {
        // Get notifications from API
        const notificationsData = await getNotifications();
        
        // Format notifications
        const formattedNotifications = notificationsData.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          timestamp: new Date(notification.createdAt),
          type: notification.type as Notification['type'],
          read: !!notification.readAt
        }));
        
        setNotifications(formattedNotifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('حدث خطأ أثناء تحميل الإشعارات');
      
      // Fallback to mock data
      setNotifications([
        {
          id: '1',
          title: 'تحديث البرنامج التدريبي',
          message: 'تم تحديث برنامجك التدريبي لهذا الأسبوع. تفقد التمارين الجديدة!',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          type: 'info',
          read: false
        },
        {
          id: '2',
          title: 'تهانينا!',
          message: 'لقد أكملت جميع تمارين اليوم. أحسنت!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          type: 'success',
          read: false
        },
        {
          id: '3',
          title: 'تذكير بموعد التمرين',
          message: 'لديك تمرين مجدول بعد ساعة من الآن',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          type: 'warning',
          read: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainees = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from('trainee_profiles')
          .select('id, name, email')
          .eq('status', 'active')
          .neq('email', 'mk@powerhouse.com')
          .order('name');

        if (error) throw error;
        setTrainees(data || []);
      } else {
        // Mock data for development
        setTrainees([
          { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com' },
          { id: '2', name: 'سارة علي', email: 'sara@example.com' },
          { id: '3', name: 'محمد خالد', email: 'mohamed@example.com' },
          { id: '4', name: 'فاطمة أحمد', email: 'fatima@example.com' },
          { id: '5', name: 'عمر حسن', email: 'omar@example.com' },
          { id: '6', name: 'ليلى سعيد', email: 'layla@example.com' },
          { id: '7', name: 'خالد عمر', email: 'khaled@example.com' },
          { id: '8', name: 'نور محمد', email: 'noor@example.com' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching trainees:', err);
      setError('حدث خطأ أثناء تحميل قائمة المتدربين');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainees = trainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTraineeSelect = (traineeId: string) => {
    setSelectedTrainees(prev =>
      prev.includes(traineeId)
        ? prev.filter(id => id !== traineeId)
        : [...prev, traineeId]
    );
  };

  const handleSendNotification = async () => {
    if (!title || !message) {
      setError('يرجى إدخال عنوان ونص الإشعار');
      return;
    }

    if (notificationType === 'specific' && selectedTrainees.length === 0) {
      setError('يرجى اختيار متدرب واحد على الأقل');
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      if (isSupabaseConnected()) {
        // Get current user (admin)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }
        
        if (notificationType === 'all') {
          // Send to all trainees (null recipient_id means broadcast)
          const { error } = await supabase
            .from('notifications')
            .insert({
              title,
              message,
              type: notificationMessageType,
              sender_id: user.id,
              recipient_id: null
            });
            
          if (error) throw error;
        } else {
          // Send to specific trainees
          const notifications = selectedTrainees.map(traineeId => ({
            title,
            message,
            type: notificationMessageType,
            sender_id: user.id,
            recipient_id: traineeId
          }));
          
          const { error } = await supabase
            .from('notifications')
            .insert(notifications);
            
          if (error) throw error;
        }
      } else {
        // Use the notification API for development
        if (notificationType === 'all') {
          await sendNotification(title, message, notificationMessageType);
        } else {
          // Send to each selected trainee
          for (const traineeId of selectedTrainees) {
            await sendNotification(title, message, notificationMessageType, traineeId);
          }
        }
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setShowSuccess(false);
        setShowNewNotification(false);
        setTitle('');
        setMessage('');
        setSelectedTrainees([]);
        setNotificationType('all');
        setNotificationMessageType('info');
        // Refresh notifications list
        fetchNotifications();
      }, 2000);
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('حدث خطأ أثناء إرسال الإشعار');
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    navigate('/admin');
  };

  const getNotificationStyle = (type: string, read: boolean) => {
    const baseStyle = 'rounded-2xl p-6 border transition-all';
    const unreadStyle = !read ? 'border-[#0AE7F2]' : 'border-[#0AE7F2]/20';
    
    switch (type) {
      case 'success':
        return `${baseStyle} ${unreadStyle} bg-[#1A1F2E]/60 backdrop-blur-sm hover:bg-[#1A1F2E]/80`;
      case 'warning':
      case 'weight':
        return `${baseStyle} ${unreadStyle} bg-[#1A1F2E]/60 backdrop-blur-sm hover:bg-[#1A1F2E]/80`;
      case 'error':
        return `${baseStyle} ${unreadStyle} bg-[#1A1F2E]/60 backdrop-blur-sm hover:bg-[#1A1F2E]/80`;
      case 'exercise':
        return `${baseStyle} ${unreadStyle} bg-[#1A1F2E]/60 backdrop-blur-sm hover:bg-[#1A1F2E]/80`;
      case 'meal':
        return `${baseStyle} ${unreadStyle} bg-[#1A1F2E]/60 backdrop-blur-sm hover:bg-[#1A1F2E]/80`;
      case 'subscription':
        return `${baseStyle} ${unreadStyle} bg-[#1A1F2E]/60 backdrop-blur-sm hover:bg-[#1A1F2E]/80`;
      default:
        return `${baseStyle} ${unreadStyle} bg-[#1A1F2E]/60 backdrop-blur-sm hover:bg-[#1A1F2E]/80`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-[#0AE7F2]" />;
      case 'warning':
      case 'weight':
        return <Clock size={24} className="text-[#0AE7F2]" />;
      default:
        return <Bell size={24} className="text-[#0AE7F2]" />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      
      // Update local state
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      ));
      
      setSelectedNotification(null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      
      // Update local state
      setNotifications(notifications.filter(notification => notification.id !== id));
      setSelectedNotification(null);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0F1C]">
        <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0F1C] text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM32 0l-9.9 9.9 1.414 1.414L33.414 1.414 32 0zm-3.172 0L19.757 9.071l1.415 1.414L31.243 0h-2.415zm-5.656 0L14.343 8.828l1.415 1.415L25.586 0h-2.415zm-5.656 0L8.687 8.828 10.1 10.243 20.93 0h-3.414zM28.828 0L27.414 1.414 33.414 7.414V0h-4.586zm-9.656 0L17.757 1.414 23.757 7.414V0h-4.585zm-9.657 0L8.1 1.414l6 6V0H9.516zM0 0c0 .828.635 1.5 1.414 1.5.793 0 1.414-.672 1.414-1.5H0zm0 4.172l4.172 4.172 1.415-1.415L1.414 2.757 0 4.172zm0 5.656l9.828 9.828 1.414-1.414L1.414 8.414 0 9.828zm0 5.656l14.485 14.485 1.414-1.414L1.414 14.07 0 15.485zm0 5.657l19.142 19.142 1.414-1.414L1.414 19.728 0 21.142zm0 5.657l23.8 23.8 1.414-1.414L1.414 25.385 0 26.8zm0 5.657l28.456 28.457 1.414-1.414L1.414 31.042 0 32.456zm0 5.657l33.113 33.114 1.414-1.414L1.414 36.7 0 38.113zm0 5.657l37.77 37.77 1.415-1.414L1.414 42.356 0 43.77zm0 5.657l42.427 42.428 1.414-1.414L1.414 48.013 0 49.427zm0 5.657l47.084 47.085 1.414-1.414L1.414 53.67 0 55.084zm0 5.657l51.741 51.741 1.414-1.414L1.414 59.327 0 60.741zm0 5.657l56.398 56.398 1.414-1.414L1.414 65.084 0 66.498zm60.741 0L0 5.757 1.414 4.343 60.74 63.67l-1.414 1.414z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#1A1F2E]/80 backdrop-blur-lg border-b border-[#0AE7F2]/20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleBack}
                className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
              >
                <ArrowLeft size={20} className="text-[#0AE7F2]" />
              </button>
              <h1 className="text-xl font-bold">الإشعارات</h1>
              <button
                onClick={() => setShowNewNotification(true)}
                className="bg-[#0AE7F2] text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center gap-2"
              >
                <Bell size={16} />
                <span>إشعار جديد</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6">
              {error}
              <button 
                onClick={fetchNotifications}
                className="underline hover:no-underline mt-2 block w-full"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={getNotificationStyle(notification.type, notification.read)}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-[#0AE7F2]/10 p-3 rounded-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{notification.title}</h3>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-[#0AE7F2] rounded-full"></span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                          <button 
                            onClick={() => setSelectedNotification(selectedNotification === notification.id ? null : notification.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-400">{notification.message}</p>

                      {/* Action Menu */}
                      {selectedNotification === notification.id && (
                        <div className="mt-4 flex gap-4 border-t border-[#0AE7F2]/20 pt-4">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-sm text-[#0AE7F2] hover:text-[#0AE7F2]/80 transition-colors"
                            >
                              تحديد كمقروء
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-sm text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            <span>حذف</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-[#0AE7F2]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-[#0AE7F2]" />
              </div>
              <h3 className="text-lg font-bold mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-400">اضغط على زر "إشعار جديد" لإرسال إشعار</p>
            </div>
          )}
        </div>
      </div>

      {/* New Notification Modal */}
      {showNewNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#0AE7F2]/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">إرسال إشعار جديد</h2>
                <button 
                  onClick={() => setShowNewNotification(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6">
                  {error}
                </div>
              )}

              {/* Notification Type */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">نوع الإشعار</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setNotificationType('all')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                      notificationType === 'all'
                        ? 'bg-[#0AE7F2] text-black'
                        : 'bg-[#0A0F1C] text-gray-400'
                    }`}
                  >
                    <Users size={20} />
                    <span>إشعار للجميع</span>
                  </button>
                  <button
                    onClick={() => setNotificationType('specific')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                      notificationType === 'specific'
                        ? 'bg-[#0AE7F2] text-black'
                        : 'bg-[#0A0F1C] text-gray-400'
                    }`}
                  >
                    <User size={20} />
                    <span>إشعار مخصص</span>
                  </button>
                </div>
              </div>

              {/* Message Type */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">نوع الرسالة</label>
                <select
                  value={notificationMessageType}
                  onChange={(e) => setNotificationMessageType(e.target.value as any)}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                >
                  <option value="info">معلومات</option>
                  <option value="success">نجاح</option>
                  <option value="warning">تنبيه</option>
                  <option value="error">خطأ</option>
                  <option value="exercise">تمرين</option>
                  <option value="meal">وجبة</option>
                  <option value="weight">وزن</option>
                  <option value="subscription">اشتراك</option>
                </select>
              </div>

              {/* Title & Message */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">عنوان الإشعار</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#0AE7F2]"
                    placeholder="أدخل عنوان الإشعار"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">نص الإشعار</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#0AE7F2] h-32 resize-none"
                    placeholder="أدخل نص الإشعار"
                  />
                </div>
              </div>

              {/* Trainees Selection */}
              {notificationType === 'specific' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-400">اختر المتدربين</label>
                    <span className="text-xs text-[#0AE7F2]">
                      {selectedTrainees.length} متدرب محدد
                    </span>
                  </div>
                  
                  <div className="relative mb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="البحث عن متدرب..."
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#0AE7F2]"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={24} className="text-[#0AE7F2] animate-spin" />
                    </div>
                  ) : (
                    <div className="bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl max-h-48 overflow-y-auto">
                      {filteredTrainees.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          {searchQuery ? 'لا توجد نتائج مطابقة للبحث' : 'لا يوجد متدربين'}
                        </div>
                      ) : (
                        filteredTrainees.map((trainee) => (
                          <label
                            key={trainee.id}
                            className="flex items-center justify-between p-3 hover:bg-[#0AE7F2]/5 cursor-pointer border-b border-[#0AE7F2]/10 last:border-0"
                          >
                            <div>
                              <p className="font-medium">{trainee.name}</p>
                              <p className="text-sm text-gray-400">{trainee.email}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedTrainees.includes(trainee.id)}
                              onChange={() => handleTraineeSelect(trainee.id)}
                              className="w-5 h-5 rounded border-[#0AE7F2]/20 bg-[#0A0F1C] text-[#0AE7F2] focus:ring-[#0AE7F2] focus:ring-offset-0"
                            />
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Info Box */}
              <div className="bg-[#0A0F1C] rounded-xl p-4 flex items-start gap-3 mb-6">
                <Info size={20} className="text-[#0AE7F2] flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-400">
                  {notificationType === 'all'
                    ? 'سيتم إرسال هذا الإشعار لجميع المتدربين في النظام'
                    : 'سيتم إرسال هذا الإشعار فقط للمتدربين المحددين'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#0AE7F2]/20">
              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowNewNotification(false)}
                  className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sending || !title || !message || (notificationType === 'specific' && selectedTrainees.length === 0)}
                  className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>إرسال الإشعار</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg z-50">
          <CheckCircle size={20} />
          <span>تم إرسال الإشعار بنجاح</span>
        </div>
      )}
    </div>
  );
}