import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatPageProps {
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

export function ChatPage({ onBack }: ChatPageProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);

    const newMessage: Message = {
      id: `${Date.now()}`,
      content: message.trim(),
      timestamp: new Date(),
      isCurrentUser: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setSending(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBack = () => {
    navigate('/trainee');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div dir="rtl" className="h-screen flex flex-col bg-[#0A0F1C] text-white relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#1A1F2E]/80 backdrop-blur-lg border-b border-[#0AE7F2]/20">
        <button onClick={handleBack} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold">الدردشة</h2>
        <div style={{ width: '24px' }} />
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            لا توجد رسائل بعد...
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] rounded-2xl p-3 ${msg.isCurrentUser ? 'bg-[#0AE7F2] text-black' : 'bg-[#1A1F2E]/80 border border-[#0AE7F2]/20'}`}>
                <p>{msg.content}</p>
                <div className="text-xs mt-2 text-right text-gray-400">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1A1F2E]/95 backdrop-blur-lg border-t border-[#0AE7F2]/20 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-black/40 rounded-full px-4 py-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sending}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            className="flex items-center justify-center p-3 rounded-full bg-[#0AE7F2] hover:bg-[#0AE7F2]/90 disabled:opacity-50 transition-colors"
            style={{ minWidth: '48px', minHeight: '48px' }}
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
  );
}