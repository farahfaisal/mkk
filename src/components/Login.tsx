import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { assets } from '../lib/config/assets';

interface LoginProps {
  onRegister: () => void;
  onSuccess: () => void;
  isAdminLogin?: boolean;
}

export function Login({ onRegister, onSuccess, isAdminLogin = false }: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check for saved credentials
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
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

      // Regular user credentials for testing
      const userCredentials = {
        email: 'user@powerhouse.com',
        password: 'User@123'
      };

      // Check credentials based on login type
      const credentials = isAdminLogin ? adminCredentials : userCredentials;
      
      if (email === credentials.email && password === credentials.password) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPassword', password);
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }

        // Set user type and navigate
        localStorage.setItem('userType', isAdminLogin ? 'admin' : 'user');
        navigate(isAdminLogin ? '/admin' : '/trainee');
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

  return (
    <div dir="rtl" className="min-h-screen text-white">
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

      <div className="relative z-10">
        {/* Status Bar */}
        <div className="p-4 flex justify-between items-center">
          <div className="text-white">
            <img 
              src="https://souqpale.com/wp-content/uploads/2025/03/تصميم-بدون-عنوان-9.png" 
              alt="Logo"
              className="h-8 w-auto"
            />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-6 bg-white rounded-sm"></div>
            <div className="h-2.5 w-2 bg-white rounded-sm"></div>
            <div className="h-2.5 w-2 bg-white rounded-sm"></div>
          </div>
        </div>

        {/* Login Form */}
        <div className="px-6 pt-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {isAdminLogin ? 'تسجيل دخول المدرب' : 'تسجيل دخول المتدرب'}
            </h1>
            <p className="text-gray-400">
              {isAdminLogin 
                ? 'مرحباً بك في لوحة تحكم المدربين' 
                : 'مرحبا بعودتك! يتوجب عليك تسجيل الدخول للبدء'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm mb-2">البريد الإلكتروني:</label>
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
              <label className="block text-sm mb-2">كلمة السر:</label>
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
                onClick={() => {/* TODO: Implement password reset */}}
                className="text-[#0AE7F2] text-sm mt-2 hover:underline"
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

            {!isAdminLogin && (
              <div className="text-center">
                <p className="text-gray-400">
                  ليس لديك حساب؟{' '}
                  <button
                    type="button"
                    onClick={onRegister}
                    className="text-[#0AE7F2] hover:underline"
                  >
                    سجل الآن!
                  </button>
                </p>
              </div>
            )}
            
            {!isAdminLogin && (
             
            )}
            
            {isAdminLogin && (
             
            )}
          </form>
        </div>
      </div>
    </div>
  );
}