import { supabase, isSupabaseConnected } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  trainerId: string;
  traineeId: string;
  lastMessageAt: Date;
  status: 'active' | 'archived' | 'blocked';
}

// Get or create conversation
export const getOrCreateConversation = async (traineeId: string): Promise<Conversation> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return {
      id: uuidv4(),
      trainerId: 'trainer-id',
      traineeId,
      lastMessageAt: new Date(),
      status: 'active'
    };
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    // Check if conversation exists
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('trainee_id', traineeId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingConversation) {
      return {
        id: existingConversation.id,
        trainerId: existingConversation.trainer_id,
        traineeId: existingConversation.trainee_id,
        lastMessageAt: new Date(existingConversation.last_message_at),
        status: existingConversation.status
      };
    }
    
    // Get trainer ID (admin)
    const { data: trainer, error: trainerError } = await supabase
      .from('trainee_profiles')
      .select('id')
      .eq('email', 'mk@powerhouse.com')
      .single();
      
    if (trainerError) {
      throw trainerError;
    }
    
    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        trainer_id: trainer.id,
        trainee_id: traineeId
      })
      .select()
      .single();
      
    if (createError) {
      throw createError;
    }
    
    return {
      id: newConversation.id,
      trainerId: newConversation.trainer_id,
      traineeId: newConversation.trainee_id,
      lastMessageAt: new Date(newConversation.last_message_at),
      status: newConversation.status
    };
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw error;
  }
};

// Send message
export const sendMessage = async (conversationId: string, content: string): Promise<ChatMessage> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return {
      id: uuidv4(),
      senderId: 'user-id',
      recipientId: 'trainer-id',
      message: content,
      createdAt: new Date().toISOString()
    };
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    // Save message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
      
    return {
      id: data.id,
      senderId: data.sender_id,
      recipientId: '', // Not needed for this implementation
      message: data.content,
      readAt: data.read_at,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return [
      {
        id: '1',
        senderId: 'trainer-id',
        recipientId: 'user-id',
        message: 'مرحباً بك في برنامجك التدريبي! كيف يمكنني مساعدتك اليوم؟',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        senderId: 'user-id',
        recipientId: 'trainer-id',
        message: 'مرحباً! أريد استشارة بخصوص جدول التمارين الأسبوعي',
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        senderId: 'trainer-id',
        recipientId: 'user-id',
        message: 'بالتأكيد! هل تريد تعديل البرنامج الحالي أم إنشاء برنامج جديد يناسب أهدافك؟',
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    return data.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      recipientId: '', // Not needed for this implementation
      message: msg.content,
      readAt: msg.read_at,
      createdAt: msg.created_at
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, senderId: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    return; // No-op in development
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('المستخدم غير مسجل الدخول');
    }
    
    // Mark messages as read
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('sender_id', senderId)
      .is('read_at', null);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadMessageCount = async (): Promise<number> => {
  if (!isSupabaseConnected()) {
    return 0; // Mock data for development
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }
    
    // Get conversations for this user
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`trainer_id.eq.${user.id},trainee_id.eq.${user.id}`);
      
    if (convError) {
      throw convError;
    }
    
    if (!conversations.length) {
      return 0;
    }
    
    // Count unread messages
    const { count, error: countError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', conversations.map(c => c.id))
      .neq('sender_id', user.id)
      .is('read_at', null);
      
    if (countError) {
      throw countError;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
};