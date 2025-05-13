import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { assets } from '../lib/config/assets';

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem('savedAdminEmail');
    const savedPassword = localStorage.getItem('savedAdminPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Admin credentials
      const adminCredentials = {
        email: 'mk@powerhouse.com',
        password: 'Admin@123'
      };
      
      if (email === adminCredentials.email && password === adminCredentials.password) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('savedAdminEmail', email);
          localStorage.setItem('savedAdminPassword', password);
        } else {
          localStorage.removeItem('savedAdminEmail');
          localStorage.removeItem('savedAdminPassword');
        }

        // Set user type and navigate
        localStorage.setItem('userType', 'admin');
        navigate('/admin');
        onSuccess();
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدخول');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    navigate('/reset-password');
  };

  return (
    <div dir="rtl" className="min-h-screen text-white flex items-center justify-center pt-0 mt-0">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url("${assets.backgrounds.main}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto px-6 -mt-10">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img 
            src="https://souqpale.com/wp-content/uploads/2025/03/تصميم-بدون-عنوان-9.png" 
            alt="Logo"
            className="h-24 w-auto"
          />
        </div>

        {/* Login Form */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-1">
            مرحباً بك
          </h1>
          <p className="text-gray-400">
            مرحباً بك في لوحة تحكم المدربين
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">البريد الإلكتروني:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl p-4 focus:outline-none focus:border-[#0AE7F2]"
              placeholder="example@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">كلمة السر:</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl p-4 pr-12 focus:outline-none focus:border-[#0AE7F2]"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-[#0AE7F2] text-sm mt-1 hover:underline"
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#0AE7F2]/20 bg-[#1A1F2E]/60 text-[#0AE7F2] focus:ring-[#0AE7F2] focus:ring-offset-0"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-400">
              تذكرني
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0AE7F2] text-black py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0AE7F2]/90 transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>جاري تسجيل الدخول...</span>
              </div>
            ) : (
              'تسجيل الدخول!'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}