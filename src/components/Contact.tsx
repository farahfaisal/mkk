import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Image, Paperclip, Smile, User, Check, CheckCheck, Clock } from 'lucide-react';

interface ContactProps {
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'trainer';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export function Contact({ onBack }: ContactProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً بك في برنامجك التدريبي! كيف يمكنني مساعدتك اليوم؟',
      sender: 'trainer',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'read'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      const trainerResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'حسناً، سأقوم بمساعدتك. هل يمكنك إخباري بما تحتاج؟',
        sender: 'trainer',
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, trainerResponse]);
      setIsTyping(false);

      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 500);
    }, 2500);
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

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white">
      {/* Background */}
      <div className="bg-base">
        <div className="bg-overlay">
          <div className="bg-pattern" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="header-base">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-white">
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
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto content-container space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.sender === 'user'
                    ? 'bg-[#0AE7F2] text-black'
                    : 'bg-[#1A1F2E]/60 backdrop-blur-sm border border-[#0AE7F2]/20'
                }`}
              >
                <p className="mb-2">{msg.text}</p>
                <div className="flex items-center justify-end gap-2 text-xs">
                  <span className={msg.sender === 'user' ? 'text-black/60' : 'text-gray-400'}>
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                  {msg.sender === 'user' && getMessageStatus(msg.status)}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#1A1F2E]/60 backdrop-blur-sm border border-[#0AE7F2]/20 rounded-2xl p-4">
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
        <div className="bg-[#1A1F2E]/80 backdrop-blur-lg border-t border-[#0AE7F2]/20 p-5 safe-area-bottom">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSendMessage}
              className="button-base bg-[#0AE7F2] text-black p-3 rounded-xl hover:bg-[#0AE7F2]/90 transition-colors"
            >
              <Send size={20} />
            </button>
            <div className="w-[280px] flex items-center gap-2 bg-[#0A0F1C]/50 rounded-xl border border-[#0AE7F2]/20 px-3">
              <button className="text-[#0AE7F2] hover:text-[#0AE7F2]/80 p-2">
                <Image size={20} />
              </button>
              <button className="text-[#0AE7F2] hover:text-[#0AE7F2]/80 p-2">
                <Paperclip size={20} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="w-[140px] bg-transparent px-2 py-3 text-white placeholder-gray-400 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button className="text-[#0AE7F2] hover:text-[#0AE7F2]/80 p-2">
                <Smile size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}