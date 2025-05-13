import React, { useEffect, useState } from 'react';
import { Home, Bell, MessageCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className = "" }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (location.pathname.startsWith('/trainee')) {
      fetchUnreadCounts();
    }
  }, [location.pathname]);

  const fetchUnreadCounts = async () => {
    try {
      if (!isSupabaseConnected()) {
        setUnreadMessages(0);
        setUnreadNotifications(0);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnreadMessages(0);
        setUnreadNotifications(0);
        return;
      }

      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('trainee_id', user.id);

      let messageCount = 0;
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map((c) => c.id);
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id)
          .is('read_at', null);
        messageCount = count || 0;
      }

      // Fix: Changed user_id to recipient_id in the query
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
        .is('read_at', null);

      setUnreadMessages(messageCount);
      setUnreadNotifications(notifCount || 0);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  if (!location.pathname.startsWith('/trainee')) return null;

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-50 bg-[#0D1B2A] text-white border-t border-gray-700 w-full ${className}`}
      style={{
        paddingBottom: 'max(8px, calc(8px + env(safe-area-inset-bottom)))',
        height: 'calc(60px + env(safe-area-inset-bottom))'
      }}
    >
      <div className="max-w-[600px] mx-auto flex justify-between items-center px-4 py-2">
        <NavButton icon={<Home size={22} />} label="الرئيسية" onClick={() => navigate('/trainee')} />
        <NavButton
          icon={<Bell size={22} />}
          label="الإشعارات"
          count={unreadNotifications}
          onClick={() => navigate('/trainee/notifications')}
        />
        <NavButton
          icon={<MessageCircle size={22} />}
          label="التواصل"
          count={unreadMessages}
          onClick={() => navigate('/trainee/chat')}
        />
        <NavButton icon={<User size={22} />} label="حسابي" onClick={() => navigate('/trainee/profile')} />
      </div>
    </nav>
  );
}

function NavButton({
  icon,
  label,
  count,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0 relative text-xs text-white font-medium pb-1"
      title={label}
      aria-label={label}
    >
      <div className="relative">
        <div
          className="text-[#0AE7F2]"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(10, 231, 242, 0.7)) drop-shadow(0 0 20px rgba(10, 231, 242, 0.5)) drop-shadow(0 0 30px rgba(10, 231, 242, 0.3))',
          }}
        >
          {icon}
        </div>
        {(count ?? 0) > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
      {label}
    </button>
  );
}