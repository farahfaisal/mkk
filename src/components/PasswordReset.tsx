import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface PasswordResetProps {
  onBack: () => void;
}

export function PasswordReset({ onBack }: PasswordResetProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email) {
        throw new Error('يرجى إدخال البريد الإلكتروني');
      }

      if (isSupabaseConnected()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password-confirmation`,
        });

        if (error) throw error;
      }

      // Show success message even in development mode
      setSuccess(true);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إرسال طلب إعادة تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0F1C] text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM32 0l-9.9 9.9 1.414 1.414L33.414 1.414 32 0zm-3.172 0L19.757 9.071l1.415 1.414L31.243 0h-2.415zm-5.656 0L14.343 8.828l1.415 1.415L25.586 0h-2.415zm-5.656 0L8.687 8.828 10.1 10.243 20.93 0h-3.414zM28.828 0L27.414 1.414 33.414 7.414V0h-4.586zm-9.656 0L17.757 1.414 23.757 7.414V0h-4.585zm-9.657 0L8.1 1.414l6 6V0H9.516zM0 0c0 .828.635 1.5 1.414 1.5.793 0 1.414-.672 1.414-1.5H0zm0 4.172l4.172 4.172 1.415-1.415L1.414 2.757 0 4.172zm0 5.656l9.828 9.828 1.414-1.414L1.414 8.414 0 9.828zm0 5.656l14.485 14.485 1.414-1.414L1.414 14.07 0 15.485zm0 5.657l19.142 19.142 1.414-1.414L1.414 19.728 0 21.142zm0 5.657l23.8 23.8 1.414-1.414L1.414 25.385 0 26.8zm0 5.657l28.456 28.457 1.414-1.414L1.414 31.042 0 32.456zm0 5.657l33.113 33.114 1.414-1.414L1.414 36.7 0 38.113zm0 5.657l37.77 37.77 1.415-1.414L1.414 42.356 0 43.77zm0 5.657l42.427 42.428 1.414-1.414L1.414 48.013 0 49.427zm0 5.657l47.084 47.085 1.414-1.414L1.414 53.67 0 55.084zm0 5.657l51.741 51.741 1.414-1.414L1.414 59.327 0 60.741zm0 5.657l56.398 56.398 1.414-1.414L1.414 65.084 0 66.498zm60.741 0L0 5.757 1.414 4.343 60.74 63.67l-1.414 1.414z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
            >
              <ArrowLeft size={20} className="text-[#0AE7F2]" />
            </button>
            <h1 className="text-xl font-bold">إعادة تعيين كلمة المرور</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pt-8">
          {success ? (
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-2xl border border-[#0AE7F2]/20 p-6 text-center">
              <div className="w-16 h-16 bg-[#0AE7F2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-[#0AE7F2]" />
              </div>
              <h2 className="text-xl font-bold mb-2">تم إرسال رابط إعادة التعيين</h2>
              <p className="text-gray-400 mb-6">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات.
              </p>
              <button
                onClick={() => navigate('/trainee/login')}
                className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors"
              >
                العودة إلى تسجيل الدخول
              </button>
            </div>
          ) : (
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-2xl border border-[#0AE7F2]/20 p-6">
              <p className="text-gray-400 mb-6">
                أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور الخاصة بك.
              </p>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6 flex items-center gap-2 justify-center">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>إرسال رابط إعادة التعيين</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}