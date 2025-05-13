import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Dashboard } from './components/Dashboard';
import { TraineeLogin } from './components/TraineeLogin';
import { AdminLogin } from './components/AdminLogin';
import { TraineeLoginWithSplash } from './components/TraineeLoginWithSplash';
import { CaloriesRate } from './components/CaloriesRate';
import { MorningWeight } from './components/MorningWeight';
import { ExerciseProgram } from './components/ExerciseProgram';
import { DietProgram } from './components/DietProgram';
import { UserProfile } from './components/UserProfile';
import { Chat } from './components/Chat';
import { Contact } from './components/Contact';
import { Notifications } from './components/Notifications';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminNotifications } from './components/AdminNotifications';
import { TrainerChat } from './components/TrainerChat';
import { AdminChat } from './components/AdminChat';
import { ChatPage } from './components/ChatPage';
import { PasswordReset } from './components/PasswordReset';
import { PasswordResetConfirmation } from './components/PasswordResetConfirmation';
import { NewTraineeRegistration } from './components/NewTraineeRegistration';
import { TraineeSteps } from './components/TraineeSteps';
import { EmbedDemo } from './components/EmbedDemo';
import { LoginEmbedDemo } from './components/LoginEmbedDemo';

import { initializeSupabase } from './lib/supabase';

function App() {
  const [userType, setUserType] = useState<'admin' | 'user' | null>(() => {
    return localStorage.getItem('userType') as 'admin' | 'user' | null;
  });

  useEffect(() => {
    initializeSupabase();

    // دعم safe-area في iOS
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');

    // تفعيل وضع العرض الكامل داخل WebView
    if (typeof window !== 'undefined' && 'StatusBar' in window) {
      try {
        window.StatusBar.styleLightContent?.();
        window.StatusBar.backgroundColorByHexString?.('#0A0F1C');
        window.StatusBar.overlaysWebView?.(false);
        window.StatusBar.show?.();
      } catch (err) {
        console.warn('StatusBar API not available:', err);
      }
    }

    if ('Navigation' in window && typeof window.Navigation?.hideNavigationBar === 'function') {
      try {
        window.Navigation.hideNavigationBar();
      } catch (err) {
        console.warn('Navigation API not available:', err);
      }
    }
  }, []);

  const handleLoginSuccess = (type: 'admin' | 'user') => {
    setUserType(type);
    localStorage.setItem('userType', type);
  };

  return (
    <div
      id="root"
      className="w-full h-screen bg-[#0A0F1C] text-white flex flex-col overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        height: '100dvh',
      }}
    >
      <Router>
        <Routes>
          {/* الدخول الأساسي */}
          <Route
            path="/"
            element={
              userType ? (
                <Navigate to={userType === 'admin' ? '/admin' : '/trainee'} replace />
              ) : (
                <TraineeLoginWithSplash onSuccess={() => handleLoginSuccess('user')} />
              )
            }
          />

          {/* دخول المدير */}
          <Route
            path="/admin/login"
            element={
              userType ? (
                <Navigate to={userType === 'admin' ? '/admin' : '/trainee'} replace />
              ) : (
                <AdminLogin onSuccess={() => handleLoginSuccess('admin')} />
              )
            }
          />

          {/* تسجيل متدرب جديد */}
          <Route
            path="/trainee/register"
            element={
              userType ? (
                <Navigate to={userType === 'admin' ? '/admin' : '/trainee'} replace />
              ) : (
                <NewTraineeRegistration />
              )
            }
          />

          {/* إعادة تعيين كلمة المرور */}
          <Route path="/reset-password" element={<PasswordReset onBack={() => {}} />} />
          <Route path="/reset-password-confirmation" element={<PasswordResetConfirmation />} />

          {/* صفحات مضمنة للتجربة */}
          <Route path="/embed" element={<EmbedDemo onBack={() => {}} />} />
          <Route path="/login-embed" element={<LoginEmbedDemo onBack={() => {}} />} />

          {/* صفحات المدير */}
          <Route path="/admin" element={userType === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/notifications" element={userType === 'admin' ? <AdminNotifications /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/chat" element={userType === 'admin' ? <AdminChat /> : <Navigate to="/admin/login" />} />
          <Route path="/admin/trainer-chat" element={userType === 'admin' ? <TrainerChat /> : <Navigate to="/admin/login" />} />

          {/* صفحات المتدرب */}
          <Route
            path="/trainee/*"
            element={
              userType === 'user' ? (
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="weight" element={<MorningWeight />} />
                  <Route path="calories" element={<CaloriesRate />} />
                  <Route path="exercise" element={<ExerciseProgram />} />
                  <Route path="diet" element={<DietProgram />} />
                  <Route path="profile" element={<UserProfile />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="steps" element={<TraineeSteps />} />
                </Routes>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* أي مسار غير معروف */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;