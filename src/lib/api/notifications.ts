import { supabase, isSupabaseConnected } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  senderId?: string;
  recipientId?: string;
  readAt?: string;
  createdAt: string;
}

// Get notifications for current user
export const getNotifications = async (): Promise<Notification[]> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return [
      {
        id: '1',
        title: 'تحديث البرنامج التدريبي',
        message: 'تم تحديث برنامجك التدريبي لهذا الأسبوع. تفقد التمارين الجديدة!',
        type: 'info',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
      },
      {
        id: '2',
        title: 'تهانينا!',
        message: 'لقد أكملت جميع تمارين اليوم. أحسنت!',
        type: 'success',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: '3',
        title: 'تذكير بموعد التمرين',
        message: 'لديك تمرين مجدول بعد ساعة من الآن',
        type: 'warning',
        readAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
      }
    ];
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    // Get notifications for this user
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      senderId: notification.sender_id,
      recipientId: notification.recipient_id,
      readAt: notification.read_at,
      createdAt: notification.created_at
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Send notification
export const sendNotification = async (
  title: string,
  message: string,
  type: string,
  recipientId?: string
): Promise<Notification> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return {
      id: uuidv4(),
      title,
      message,
      type,
      recipientId,
      createdAt: new Date().toISOString()
    };
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    // Save notification
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        title,
        message,
        type,
        sender_id: user.id,
        recipient_id: recipientId
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      type: data.type,
      senderId: data.sender_id,
      recipientId: data.recipient_id,
      readAt: data.read_at,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    return; // No-op in development
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    // Mark notification as read
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .or(`recipient_id.eq.${user.id},recipient_id.is.null`);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    return; // No-op in development
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    // Delete notification
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .or(`recipient_id.eq.${user.id},recipient_id.is.null`);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  if (!isSupabaseConnected()) {
    return 2; // Mock data for development
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }
    
    // Count unread notifications
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
      .is('read_at', null);
      
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};