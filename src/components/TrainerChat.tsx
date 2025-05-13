import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Search, User, MessageCircle, Clock, CheckCircle, Send, Image, Smile, Paperclip, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface TrainerChatProps {
  onBack?: () => void;
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
}

export function TrainerChat({ onBack }: TrainerChatProps) {
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

  const handleBackButton = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1); // fallback to browser history
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTrainee || !conversation) return;
    const newMessageText = replyText.trim();
    setReplyText('');
    setSending(true);

    try {
      if (isSupabaseConnected()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('المستخدم غير مسجل الدخول');

        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          traineeId: selectedTrainee.id,
          traineeName: 'المدرب',
          content: newMessageText,
          timestamp: new Date(),
          status: 'unread',
          isReply: true,
        };
        setMessages(prev => [...prev, tempMessage]);

        const { data, error } = await supabase
          .from('messages')
          .insert({ conversation_id: conversation.id, sender_id: user.id, content: newMessageText })
          .select()
          .single();
        if (error) throw error;

        await supabase
          .from('conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);

        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id
            ? { ...msg, id: data.id, timestamp: new Date(data.created_at) }
            : msg
        ));
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

  const filteredTrainees = trainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div dir="rtl" className="h-screen w-full max-w-screen flex bg-[#0A0F1C] text-white overflow-hidden">
      {/* الباقي بدون تغيير */}
    </div>
  );
}
