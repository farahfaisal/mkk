import React from 'react';
import { X, User, Heart, ChevronLeft, LogOut } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  menuItems: MenuItem[];
  userName: string;
  gender: string;
}

export function SidebarMenu({
  isOpen,
  onClose,
  onNavigate,
  onLogout,
  menuItems,
  userName,
  gender
}: SidebarMenuProps) {
  const getGenderSymbol = (gender: string) => {
    switch (gender) {
      case 'male': return '♂';
      case 'female': return '♀';
      default: return '⚦';
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return 'ذكر';
      case 'female': return 'أنثى';
      default: return 'آخر';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-[#1A1F2E]/95 backdrop-blur-lg z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#0AE7F2]/20 flex items-center justify-between">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#0AE7F2]/10"
            >
              <X size={24} className="text-[#0AE7F2]" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center">
                <User size={20} className="text-[#0AE7F2]" />
              </div>
              <div className="text-right">
                <h3 className="font-bold">{userName}</h3>
                <div className="flex items-center text-[#0AE7F2] text-sm">
                  <Heart size={12} className="ml-1" />
                  <span>{getGenderText(gender)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#0AE7F2]/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center">
                      <item.icon size={18} className="text-[#0AE7F2]" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center">
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ml-2">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                    <ChevronLeft size={16} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-[#0AE7F2]/20">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}