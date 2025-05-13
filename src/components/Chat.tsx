import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Plus, Image, Paperclip, Smile, User, Check, CheckCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { getOrCreateConversation, getMessages, markMessagesAsRead, sendMessage } from '../lib/api/chat';
import { formatDate } from '../lib/utils/date';

interface ChatProps {
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'trainer';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'pending';
}

interface Conversation {
  id: string;
  trainerId: string;
  traineeId: string;
  lastMessageAt: Date;
}

export function Chat({ onBack }: ChatProps) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
    // Focus input when component mounts
    inputRef.current?.focus();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      
      if (isSupabaseConnected()) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // For development, use mock data
          setMockData();
          return;
        }
        
        // Get or create conversation with trainer
        const conv = await getOrCreateConversation(user.id);
        setConversation(conv);
        
        // Get messages
        const messagesData = await getMessages(conv.id);
        
        // Format messages
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.senderId === conv.trainerId ? 'trainer' : 'user',
          timestamp: new Date(msg.createdAt),
          status: msg.readAt ? 'read' : 'delivered'
        }));
        
        setMessages(formattedMessages);
        
        // Mark trainer messages as read
        const trainerMessages = messagesData
          .filter(msg => msg.senderId === conv.trainerId && !msg.readAt)
          .map(msg => msg.id);
          
        if (trainerMessages.length > 0) {
          await markMessagesAsRead(conv.id, conv.trainerId);
        }
      } else {
        // Mock data for development
        setMockData();
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
      // If there's an error, use mock data
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    // Set mock conversation
    setConversation({
      id: uuidv4(),
      trainerId: 'trainer-id',
      traineeId: 'trainee-id',
      lastMessageAt: new Date()
    });
    
    // Set mock messages
    setMessages([
      {
        id: '1',
        text: 'مرحباً بك في برنامجك التدريبي! كيف يمكنني مساعدتك اليوم؟',
        sender: 'trainer',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: '2',
        text: 'مرحباً! أريد استشارة بخصوص جدول التمارين الأسبوعي',
        sender: 'user',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: '3',
        text: 'بالتأكيد! هل تريد تعديل البرنامج الحالي أم إنشاء برنامج جديد يناسب أهدافك؟',
        sender: 'trainer',
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
        status: 'read'
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    try {
      if (isSupabaseConnected()) {
        // Send message to API
        const sentMessage = await sendMessage(conversation.id, message);
        
        // Update message status to delivered
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, id: sentMessage.id, status: 'delivered' as const } : msg
          )
        );
      }
      
      // Simulate trainer typing and response
      setIsTyping(true);
      
      setTimeout(() => {
        const trainerResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'حسناً، سأقوم بمراجعة برنامجك الحالي وأقترح التعديلات المناسبة. هل يمكنك إخباري عن أهدافك الحالية؟',
          sender: 'trainer',
          timestamp: new Date(),
          status: 'sent'
        };
        
        setMessages(prev => [...prev, trainerResponse]);
        setIsTyping(false);
        
        // Mark user message as read
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === newMessage.id ? { ...msg, status: 'read' as const } : msg
            )
          );
        }, 500);
      }, 2500);
    } catch (err) {
      console.error('Error sending message:', err);
      // Keep the message in the UI but mark it as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'pending' as const } : msg
        )
      );
    }
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check size={16} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={16} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={16} className="text-[#0AE7F2]" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  const formatMessageTime = (date: Date) => {
    return formatDate(date, 'HH:mm');
  };

  const attachmentOptions = [
    { icon: Image, label: 'صورة' },
    { icon: Paperclip, label: 'ملف' },
    { icon: User, label: 'جهة اتصال' }
  ];

  const handleBack = () => {
    navigate('/trainee');
  };

  if (loading) {
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

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1A1F2E]/80 backdrop-blur-lg border-b border-[#0AE7F2]/20">
          <button onClick={handleBack} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h2 className="font-bold">المدرب أحمد</h2>
              <p className="text-sm text-[#0AE7F2]">متصل الآن</p>
            </div>
            <div className="w-10 h-10 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center">
              <User size={24} className="text-[#0AE7F2]" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-48">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.sender === 'user'
                    ? 'bg-[#0AE7F2] text-black'
                    : 'bg-[#1A1F2E]/80 backdrop-blur-sm border border-[#0AE7F2]/20'
                }`}
              >
                <p className="mb-2">{msg.text}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className={`text-xs ${
                    msg.sender === 'user' ? 'text-black/60' : 'text-gray-400'
                  }`}>
                    {formatMessageTime(msg.timestamp)}
                  </span>
                  {msg.sender === 'user' && getMessageStatus(msg.status)}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1A1F2E]/80 backdrop-blur-sm border border-[#0AE7F2]/20 rounded-2xl p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#0AE7F2] rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#0AE7F2] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-[#0AE7F2] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1A1F2E]/95 backdrop-blur-lg border-t border-[#0AE7F2]/20">
          {showAttachMenu && (
            <div className="p-4 border-b border-[#0AE7F2]/20">
              <div className="flex justify-around">
                {attachmentOptions.map((option, index) => (
                  <button
                    key={index}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-[#0AE7F2]/10 transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center">
                      <option.icon size={24} className="text-[#0AE7F2]" />
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="text-[#0AE7F2] hover:bg-[#0AE7F2]/10 p-2 rounded-full transition-colors"
              >
                <Plus size={24} />
              </button>
              <div className="flex-1 bg-black/40 rounded-xl flex items-center min-h-[48px]">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none min-h-[40px]"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex items-center gap-2 px-4">
                  <button className="text-gray-400 hover:text-[#0AE7F2] transition-colors p-1">
                    <Image size={20} />
                  </button>
                  <button className="text-gray-400 hover:text-[#0AE7F2] transition-colors p-1">
                    <Smile size={20} />
                  </button>
                </div>
              </div>
              <button 
                onClick={handleSendMessage}
                className="bg-[#0AE7F2] text-black p-3 rounded-xl hover:bg-[#0AE7F2]/90 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

          {/* Extra Space Below Input */}
          <div className="h-24"></div>
        </div>
      </div>
    </div>
  );
}