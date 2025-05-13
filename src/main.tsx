import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('تحديث جديد متاح. هل ترغب في التحديث؟')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log('التطبيق جاهز للعمل بدون إنترنت');
  },
});

// Add status bar handling for Capacitor
document.addEventListener('DOMContentLoaded', () => {
  // Apply status bar styles when the app is ready
  if (window.Capacitor) {
    const { StatusBar } = window.Capacitor.Plugins;
    
    if (StatusBar) {
      StatusBar.setStyle({ style: 'DARK' });
      StatusBar.setBackgroundColor({ color: '#0A0F1C' });
      // Make status bar visible
      StatusBar.show();
      // Don't overlay WebView
      StatusBar.setOverlaysWebView({ overlay: false });
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);