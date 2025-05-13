import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, User, MessageCircle, Clock, CheckCircle, Send, Image, Smile, Paperclip, Menu, Loader2, X, Filter, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface AdminChatProps {
  onBack: () => void;
}

interface Message {
  id: string;
  traineeId: string;
  traineeName: string;
  content: string;
  timestamp: Date;
  status: 'unread' | 'read';
  isReply?: boolean;
}

interface Trainee {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount: number;
  lastActive: Date;
  plan: string;
}

export function AdminChat({ onBack }: AdminChatProps) {
  const navigate = useNavigate();
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any | null>(null);
  const [filterPlan, setFilterPlan] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTrainees();
  }, []);

  useEffect(() => {
    if (selectedTrainee) {
      fetchMessages(selectedTrainee.id);
      scrollToBottom();
    }
  }, [selectedTrainee]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTrainees = async () => {
    try {
      setLoading(true);
      
      if (isSupabaseConnected()) {
        // Get current user (admin)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }
        
        // Get all trainees
        const { data: traineeProfiles, error: traineesError } = await supabase
          .from('trainee_profiles')
          .select('id, name, email, subscription_plan')
          .neq('email', 'mk@powerhouse.com');

        if (traineesError) throw traineesError;
        
        // Get all conversations
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select(`
            id,
            trainee_id,
            last_message_at
          `)
          .eq('trainer_id', user.id);
          
        if (convError) throw convError;
        
        // Get unread message counts
        const { data: unreadCounts, error: countError } = await supabase
          .from('messages')
          .select('conversation_id, count')
          .eq('read_at', null)
          .neq('sender_id', user.id)
          .in('conversation_id', conversations.map(c => c.id))
          .group('conversation_id');
          
        if (countError) throw countError;
        
        // Format trainee data
        const formattedTrainees = traineeProfiles.map(trainee => {
          const conv = conversations.find(c => c.trainee_id === trainee.id);
          const unreadCount = conv ? 
            unreadCounts.find(uc => uc.conversation_id === conv.id)?.count || 0 : 0;
          
          return {
            id: trainee.id,
            name: trainee.name || 'متدرب',
            lastMessage: '', // Will be populated later
            unreadCount: parseInt(unreadCount as string || '0'),
            lastActive: conv?.last_message_at ? new Date(conv.last_message_at) : new Date(),
            plan: trainee.subscription_plan
          };
        });
        
        // Get last message for each conversation
        for (const trainee of formattedTrainees) {
          const conv = conversations.find(c => c.trainee_id === trainee.id);
          if (conv) {
            const { data: lastMessage } = await supabase
              .from('messages')
              .select('content')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (lastMessage) {
              trainee.lastMessage = lastMessage.content;
            }
          }
        }
        
        setTrainees(formattedTrainees);
      } else {
        // Mock data for development
        setTrainees([
          {
            id: '123e4567-e89b-12d3-a456-426614174030',
            name: 'أحمد محمد',
            lastMessage: 'مرحباً، عندي استفسار عن برنامج التمارين',
            unreadCount: 2,
            lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            plan: 'premium'
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174031',
            name: 'سارة علي',
            lastMessage: 'شكراً جزيلاً على المساعدة',
            unreadCount: 0,
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            plan: 'basic'
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174032',
            name: 'محمد خالد',
            lastMessage: 'هل يمكنني تغيير موعد التمرين؟',
            unreadCount: 1,
            lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            plan: 'pro'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching trainees:', err);
      setError('حدث خطأ أثناء تحميل قائمة المتدربين');
      
      // Fallback to mock data
      setTrainees([
        {
          id: '123e4567-e89b-12d3-a456-426614174030',
          name: 'أحمد محمد',
          lastMessage: 'مرحباً، عندي استفسار عن برنامج التمارين',
          unreadCount: 2,
          lastActive: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          plan: 'premium'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174031',
          name: 'سارة علي',
          lastMessage: 'شكراً جزيلاً على المساعدة',
          unreadCount: 0,
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          plan: 'basic'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174032',
          name: 'محمد خالد',
          lastMessage: 'هل يمكنني تغيير موعد التمرين؟',
          unreadCount: 1,
          lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          plan: 'pro'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (traineeId: string) => {
    try {
      if (isSupabaseConnected()) {
        // Get current user (admin)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }
        
        // Get or create conversation
        let conversation;
        const { data: existingConv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('trainee_id', traineeId)
          .eq('trainer_id', user.id)
          .single();
          
        if (convError) {
          if (convError.code === 'PGRST116') {
            // Conversation doesn't exist, create it
            const { data: newConv, error: createError } = await supabase
              .from('conversations')
              .insert({
                trainee_id: traineeId,
                trainer_id: user.id,
                status: 'active'
              })
              .select()
              .single();
              
            if (createError) throw createError;
            conversation = newConv;
          } else {
            throw convError;
          }
        } else {
          conversation = existingConv;
        }
        
        setConversation(conversation);
        
        // Get messages
        const { data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            content,
            created_at,
            read_at,
            trainee_profiles:sender_id (name)
          `)
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: true });
          
        if (msgError) throw msgError;
        
        // Format messages
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          traineeId: traineeId,
          traineeName: msg.trainee_profiles?.name || 'متدرب',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          status: msg.read_at ? 'read' : 'unread',
          isReply: msg.sender_id === user.id
        }));
        
        setMessages(formattedMessages);
        
        // Mark trainee messages as read
        const unreadMessages = messagesData
          .filter(msg => msg.sender_id === traineeId && !msg.read_at)
          .map(msg => msg.id);
          
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadMessages);
            
          // Refresh trainee list to update unread counts
          fetchTrainees();
        }
      } else {
        // Mock data for development
        const mockMessages = [
          {
            id: '1',
            traineeId: traineeId,
            traineeName: selectedTrainee?.name || 'متدرب',
            content: 'مرحباً، عندي استفسار عن برنامج التمارين',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'read'
          },
          {
            id: '2',
            traineeId: traineeId,
            traineeName: 'المدرب',
            content: 'أهلاً بك! كيف يمكنني مساعدتك؟',
            timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000),
            status: 'read',
            isReply: true
          },
          {
            id: '3',
            traineeId: traineeId,
            traineeName: selectedTrainee?.name || 'متدرب',
            content: 'هل يمكنني تغيير موعد التمرين؟',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            status: 'read'
          }
        ];
        
        setMessages(mockMessages);
        setConversation({ id: 'mock-conversation-id' });
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('حدث خطأ أثناء تحميل الرسائل');
      
      // Fallback to mock data
      const mockMessages = [
        {
          id: '1',
          traineeId: traineeId,
          traineeName: selectedTrainee?.name || 'متدرب',
          content: 'مرحباً، عندي استفسار عن برنامج التمارين',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'read'
        },
        {
          id: '2',
          traineeId: traineeId,
          traineeName: 'المدرب',
          content: 'أهلاً بك! كيف يمكنني مساعدتك؟',
          timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000),
          status: 'read',
          isReply: true
        },
        {
          id: '3',
          traineeId: traineeId,
          traineeName: selectedTrainee?.name || 'متدرب',
          content: 'هل يمكنني تغيير موعد التمرين؟',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          status: 'read'
        }
      ];
      
      setMessages(mockMessages);
      setConversation({ id: 'mock-conversation-id' });
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTrainee || !conversation) return;

    const newMessageText = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      if (isSupabaseConnected()) {
        // Get current user (admin)
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }
        
        // Add message to UI immediately
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          traineeId: selectedTrainee.id,
          traineeName: 'المدرب',
          content: newMessageText,
          timestamp: new Date(),
          status: 'unread',
          isReply: true
        };
        
        setMessages(prev => [...prev, tempMessage]);
        
        // Save message to database
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: newMessageText
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update conversation last_message_at
        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);
          
        // Update message ID in state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id ? { 
              ...msg, 
              id: data.id,
              timestamp: new Date(data.created_at)
            } : msg
          )
        );
      } else {
        // Mock sending for development
        const newMessage: Message = {
          id: Date.now().toString(),
          traineeId: selectedTrainee.id,
          traineeName: 'المدرب',
          content: newMessageText,
          timestamp: new Date(),
          status: 'unread',
          isReply: true
        };

        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('حدث خطأ أثناء إرسال الرد');
    } finally {
      setSending(false);
    }
  };

  const handleTraineeSelect = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-500/20 text-blue-400';
      case 'premium':
        return 'bg-purple-500/20 text-purple-400';
      case 'pro':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'أساسية';
      case 'premium':
        return 'متقدمة';
      case 'pro':
        return 'احترافية';
      default:
        return plan;
    }
  };

  const filteredTrainees = trainees
    .filter(trainee => 
      trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterPlan === null || trainee.plan === filterPlan)
    );

  const handleBackButton = () => {
    navigate('/admin');
  };

  if (loading && trainees.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0F1C]">
        <Loader2 className="w-12 h-12 text-[#0AE7F2] animate-spin" />
      </div>
    );
  }

  if (error && trainees.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0A0F1C] p-6">
        <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-4">
          {error}
        </div>
        <button
          onClick={fetchTrainees}
          className="bg-[#0AE7F2] text-black px-4 py-2 rounded-xl"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="h-full flex bg-[#0A0F1C] text-white">
      {/* Sidebar */}
      <div className="w-[380px] flex flex-col border-l border-[#0AE7F2]/20 bg-[#1A1F2E]/80 backdrop-blur-lg">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#0AE7F2]/20">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handleBackButton} className="text-white/80 hover:text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">المحادثات</h1>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="text-white/80 hover:text-white"
            >
              <Filter size={20} />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث عن متدرب..."
              className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl py-2 px-4 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#0AE7F2]/50"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          </div>

          {showFilters && (
            <div className="mt-4 p-3 bg-[#0A0F1C] rounded-xl border border-[#0AE7F2]/20">
              <h3 className="text-sm font-medium mb-2">تصفية حسب الخطة</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterPlan(null)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterPlan === null 
                      ? 'bg-[#0AE7F2] text-black' 
                      : 'bg-[#1A1F2E]/60 text-gray-400'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setFilterPlan('basic')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterPlan === 'basic' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  أساسية
                </button>
                <button
                  onClick={() => setFilterPlan('premium')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterPlan === 'premium' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  متقدمة
                </button>
                <button
                  onClick={() => setFilterPlan('pro')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    filterPlan === 'pro' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  احترافية
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trainees List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTrainees.map((trainee) => (
            <button
              key={trainee.id}
              onClick={() => handleTraineeSelect(trainee)}
              className={`w-full p-4 text-right hover:bg-[#0AE7F2]/5 transition-colors border-b border-[#0AE7F2]/10 ${
                selectedTrainee?.id === trainee.id ? 'bg-[#0AE7F2]/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={24} className="text-[#0AE7F2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{trainee.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPlanColor(trainee.plan)}`}>
                        {getPlanName(trainee.plan)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(trainee.lastActive, { addSuffix: true, locale: ar })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400 truncate">{trainee.lastMessage}</p>
                    {trainee.unreadCount > 0 && (
                      <span className="bg-[#0AE7F2] text-black text-xs px-2 py-0.5 rounded-full">
                        {trainee.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {filteredTrainees.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              لا توجد محادثات تطابق معايير البحث
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedTrainee ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#0AE7F2]/20 bg-[#1A1F2E]/80 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center">
                <User size={24} className="text-[#0AE7F2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg">{selectedTrainee.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPlanColor(selectedTrainee.plan)}`}>
                    {getPlanName(selectedTrainee.plan)}
                  </span>
                </div>
                <p className="text-sm text-[#0AE7F2]">
                  آخر نشاط: {formatDistanceToNow(selectedTrainee.lastActive, { addSuffix: true, locale: ar })}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isReply ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[60%] rounded-2xl p-4 ${
                    message.isReply
                      ? 'bg-[#0AE7F2] text-black'
                      : 'bg-[#1A1F2E]/80 backdrop-blur-sm border border-[#0AE7F2]/20'
                  }`}
                >
                  <p className="mb-2">{message.content}</p>
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <span className={message.isReply ? 'text-black/60' : 'text-gray-400'}>
                      {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: ar })}
                    </span>
                    {message.status === 'read' ? (
                      <CheckCircle size={14} className="text-[#0AE7F2]" />
                    ) : (
                      <Clock size={14} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          <div className="p-4 border-t border-[#0AE7F2]/20 bg-[#1A1F2E]/80 backdrop-blur-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-[#0A0F1C] rounded-xl border border-[#0AE7F2]/20">
                <div className="flex items-center">
                  <div className="flex items-center gap-2 px-3">
                    <button className="text-gray-400 hover:text-[#0AE7F2] transition-colors p-2" disabled={sending}>
                      <Image size={20} />
                    </button>
                    <button className="text-gray-400 hover:text-[#0AE7F2] transition-colors p-2" disabled={sending}>
                      <Paperclip size={20} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none min-h-[48px]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    disabled={sending}
                  />
                  <button className="text-gray-400 hover:text-[#0AE7F2] transition-colors px-3" disabled={sending}>
                    <Smile size={20} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sending}
                className="bg-[#0AE7F2] text-black p-3 rounded-xl hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#0A0F1C]">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-[#0AE7F2]" />
            </div>
            <h3 className="text-xl font-bold mb-2">اختر محادثة</h3>
            <p className="text-gray-400">اختر متدرب من القائمة لبدء المحادثة</p>
          </div>
        </div>
      )}
    </div>
  );
}