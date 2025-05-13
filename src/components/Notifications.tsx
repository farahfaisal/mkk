import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, CheckCircle, Clock, Trash2, MoreVertical, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../lib/api/notifications';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { formatRelativeTime } from '../lib/utils/date';
import { BottomNav } from './BottomNav';

interface NotificationsProps {
  onBack?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'exercise' | 'meal' | 'weight' | 'subscription';
  read: boolean;
}

export function Notifications({ onBack }: NotificationsProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('المستخدم غير مسجل الدخول');

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formatted = data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.created_at),
          type: n.type as Notification['type'],
          read: !!n.read_at
        }));

        setNotifications(formatted);
      } else {
        const data = await getNotifications();
        const formatted = data.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt),
          type: n.type as Notification['type'],
          read: !!n.readAt
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('حدث خطأ أثناء تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const getNotificationStyle = (type: string, read: boolean) => {
    const base = 'rounded-2xl p-4 border transition-all';
    const unread = !read ? 'border-[#0AE7F2]' : 'border-[#0AE7F2]/20';
    return `${base} ${unread} bg-[#1A1F2E] hover:bg-[#1F2937]`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-[#0AE7F2]" />;
      case 'warning':
      case 'weight': return <Clock size={16} className="text-[#0AE7F2]" />;
      default: return <Bell size={16} className="text-[#0AE7F2]" />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setSelectedNotification(null);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSelectedNotification(null);
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0F1C]">
        <div className="w-10 h-10 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white">
      {/* Header */}
      <div className="p-4 flex items-center border-b border-gray-700">
        <button onClick={handleBack} className="mr-2">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-semibold">الإشعارات</h2>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-4">
            {error}
            <button 
              onClick={fetchNotifications}
              className="underline hover:no-underline mt-2 block w-full"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`${getNotificationStyle(notification.type, notification.read)} mb-4`}
          >
            <div className="flex items-start gap-3">
              <div className="bg-[#0AE7F2]/10 p-2 rounded-xl">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-sm">{notification.title}</h3>
                    {!notification.read && (
                      <span className="w-1.5 h-1.5 bg-[#0AE7F2] rounded-full"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(notification.timestamp)}
                    </span>
                    <button 
                      onClick={() => setSelectedNotification(
                        selectedNotification === notification.id ? null : notification.id
                      )}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{notification.message}</p>

                {selectedNotification === notification.id && (
                  <div className="mt-2 flex gap-4 border-t border-[#0AE7F2]/20 pt-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-[#0AE7F2] hover:text-[#0AE7F2]/80"
                      >
                        تحديد كمقروء
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>حذف</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {notifications.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="bg-[#0AE7F2]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-[#0AE7F2]" />
            </div>
            <h3 className="text-base font-bold mb-1">لا توجد إشعارات</h3>
            <p className="text-sm text-gray-400">ستظهر هنا جميع إشعاراتك الجديدة</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
