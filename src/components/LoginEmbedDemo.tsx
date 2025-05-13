import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Smartphone, Monitor, Code, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoginEmbed } from './LoginEmbed';

interface LoginEmbedDemoProps {
  onBack: () => void;
}

export function LoginEmbedDemo({ onBack }: LoginEmbedDemoProps) {
  const navigate = useNavigate();
  const [embedType, setEmbedType] = useState<'fullscreen' | 'mobile' | 'responsive'>('mobile');
  const [copied, setCopied] = useState(false);

  const getEmbedCode = () => {
    const baseUrl = 'https://mk-powerhouse.netlify.app';
    
    if (embedType === 'fullscreen') {
      return `<iframe src="${baseUrl}" width="100%" height="600px" style="border: none; overflow: hidden;" allowfullscreen></iframe>`;
    } 
    else if (embedType === 'mobile') {
      return `
<div style="background-color: #111; border-radius: 40px; padding: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); max-width: 375px; margin: 0 auto; height: 700px; display: flex; flex-direction: column;">
  <div style="flex: 1; background-color: #0A0F1C; border-radius: 30px; overflow: hidden; position: relative;">
    <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 30px; background-color: #111; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; z-index: 10;"></div>
    <iframe src="${baseUrl}" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
  </div>
  <div style="width: 100px; height: 5px; background-color: #333; border-radius: 3px; margin: 10px auto 0;"></div>
</div>`;
    } 
    else {
      return `
<div style="position: relative; padding-bottom: 177.78%; /* 16:9 aspect ratio for portrait mobile */ height: 0; overflow: hidden; max-width: 100%;">
  <iframe src="${baseUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
</div>`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0F1C] text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1A1F2E]/80 backdrop-blur-lg border-b border-[#0AE7F2]/20">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBack}
              className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
            >
              <ArrowLeft size={20} className="text-[#0AE7F2]" />
            </button>
            <h1 className="text-xl font-bold">تضمين صفحة تسجيل الدخول</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-[#1A1F2E]/80 rounded-xl border border-[#0AE7F2]/20 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">اختر نوع التضمين</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setEmbedType('fullscreen')}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                embedType === 'fullscreen' 
                  ? 'bg-[#0AE7F2]/20 border-[#0AE7F2] text-[#0AE7F2]' 
                  : 'bg-[#0A0F1C] border-[#0AE7F2]/20 hover:bg-[#0AE7F2]/10'
              } border`}
            >
              <Maximize2 size={24} />
              <span>شاشة كاملة</span>
            </button>
            
            <button
              onClick={() => setEmbedType('mobile')}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                embedType === 'mobile' 
                  ? 'bg-[#0AE7F2]/20 border-[#0AE7F2] text-[#0AE7F2]' 
                  : 'bg-[#0A0F1C] border-[#0AE7F2]/20 hover:bg-[#0AE7F2]/10'
              } border`}
            >
              <Smartphone size={24} />
              <span>محاكاة هاتف محمول</span>
            </button>
            
            <button
              onClick={() => setEmbedType('responsive')}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                embedType === 'responsive' 
                  ? 'bg-[#0AE7F2]/20 border-[#0AE7F2] text-[#0AE7F2]' 
                  : 'bg-[#0A0F1C] border-[#0AE7F2]/20 hover:bg-[#0AE7F2]/10'
              } border`}
            >
              <Monitor size={24} />
              <span>متجاوب مع الشاشة</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1A1F2E]/80 rounded-xl border border-[#0AE7F2]/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">معاينة</h2>
              <button
                onClick={copyToClipboard}
                className="bg-[#0AE7F2] text-black px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#0AE7F2]/90 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>
            
            <div className="preview-container" style={{ height: '600px' }}>
              {embedType === 'fullscreen' && (
                <iframe 
                  src="https://mk-powerhouse.netlify.app" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none', borderRadius: '12px', overflow: 'hidden' }}
                  allow="accelerometer; autoplay; camera; encrypted-media; geolocation; gyroscope; microphone; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              
              {embedType === 'mobile' && (
                <LoginEmbed showDeviceFrame={true} height={600} />
              )}
              
              {embedType === 'responsive' && (
                <LoginEmbed showDeviceFrame={false} height={600} />
              )}
            </div>
          </div>
          
          <div className="bg-[#1A1F2E]/80 rounded-xl border border-[#0AE7F2]/20 p-6">
            <h2 className="text-xl font-bold mb-4">كود التضمين</h2>
            
            <div className="bg-[#0A0F1C] rounded-xl p-4 overflow-x-auto mb-6">
              <pre className="text-gray-400 text-sm whitespace-pre-wrap">{getEmbedCode()}</pre>
            </div>
            
            <h3 className="text-lg font-bold mb-2">تعليمات التضمين</h3>
            <ul className="space-y-2 text-gray-300 list-disc list-inside">
              <li>انسخ كود التضمين أعلاه والصقه في صفحة موقعك.</li>
              <li>تأكد من إضافة الوسوم التالية إلى رؤوس HTTP الخاصة بموقعك للسماح بتضمين الإطار:
                <ul className="list-disc list-inside mr-4 mt-1">
                  <li><code>X-Frame-Options: ALLOWALL</code></li>
                  <li><code>Content-Security-Policy: frame-ancestors *;</code></li>
                </ul>
              </li>
              <li>يمكنك تعديل العرض والارتفاع حسب احتياجاتك.</li>
              <li>للحصول على أفضل تجربة، نوصي باستخدام خيار "محاكاة هاتف محمول" للمواقع العادية وخيار "متجاوب مع الشاشة" للمواقع المتجاوبة.</li>
            </ul>
            
            <div className="mt-6 p-4 bg-[#0AE7F2]/10 rounded-xl border border-[#0AE7F2]/20">
              <h3 className="font-bold mb-2 text-[#0AE7F2]">ملاحظة هامة</h3>
              <p className="text-gray-300">
                لتضمين التطبيق بشكل صحيح، يجب أن يكون لديك ملف <code>_headers</code> في مجلد <code>public</code> يحتوي على الإعدادات المناسبة للسماح بتضمين الإطار.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}