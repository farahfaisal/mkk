import React, { useState } from 'react';
import { IframeEmbed } from './IframeEmbed';
import { Copy, Check, Smartphone, Monitor, Code } from 'lucide-react';

interface EmbedDemoProps {
  onBack: () => void;
}

export function EmbedDemo({ onBack }: EmbedDemoProps) {
  const [embedType, setEmbedType] = useState<'fullscreen' | 'mobile' | 'responsive'>('fullscreen');
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');

  const getEmbedCode = () => {
    const baseUrl = 'https://mk-powerhouse.netlify.app';
    
    if (embedType === 'fullscreen') {
      return `<iframe src="${baseUrl}/iframe.html" width="${width}" height="${height}" style="border: none; overflow: hidden;" allowfullscreen></iframe>`;
    } 
    else if (embedType === 'mobile') {
      return `
<div style="background-color: #111; border-radius: 40px; padding: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.5); max-width: 375px; margin: 0 auto; height: ${height}px; display: flex; flex-direction: column;">
  <div style="flex: 1; background-color: #0A0F1C; border-radius: 30px; overflow: hidden; position: relative;">
    <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 30px; background-color: #111; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; z-index: 10;"></div>
    <iframe src="${baseUrl}/iframe.html" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
  </div>
  <div style="width: 100px; height: 5px; background-color: #333; border-radius: 3px; margin: 10px auto 0;"></div>
</div>`;
    } 
    else {
      return `
<div style="position: relative; padding-bottom: 177.78%; /* 16:9 aspect ratio for portrait mobile */ height: 0; overflow: hidden; max-width: 100%;">
  <iframe src="${baseUrl}/iframe.html" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
</div>`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0F1C] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">تضمين تطبيق MK في موقعك</h1>
        
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
              <Monitor size={24} />
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
              <Code size={24} />
              <span>متجاوب مع الشاشة</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">العرض (بكسل أو %):</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">الارتفاع (بكسل):</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-[#1A1F2E]/80 rounded-xl border border-[#0AE7F2]/20 p-6 mb-6">
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
          
          <div className="bg-[#0A0F1C] rounded-xl p-4 overflow-x-auto mb-6">
            <pre className="text-gray-400 text-sm whitespace-pre-wrap">{getEmbedCode()}</pre>
          </div>
          
          <div className={`preview-container ${embedType === 'mobile' ? 'flex justify-center' : ''}`} style={{ height: embedType === 'responsive' ? '400px' : '600px' }}>
            {embedType === 'fullscreen' && (
              <IframeEmbed url="https://mk-powerhouse.netlify.app/iframe.html" height="100%" width="100%" />
            )}
            
            {embedType === 'mobile' && (
              <div className="device-frame" style={{ 
                backgroundColor: '#111', 
                borderRadius: '40px', 
                padding: '10px', 
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)', 
                maxWidth: '375px', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                <div style={{ 
                  flex: 1, 
                  backgroundColor: '#0A0F1C', 
                  borderRadius: '30px', 
                  overflow: 'hidden', 
                  position: 'relative' 
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    width: '150px', 
                    height: '30px', 
                    backgroundColor: '#111', 
                    borderBottomLeftRadius: '15px', 
                    borderBottomRightRadius: '15px', 
                    zIndex: 10 
                  }}></div>
                  <IframeEmbed url="https://mk-powerhouse.netlify.app/iframe.html" height="100%" width="100%" />
                </div>
                <div style={{ 
                  width: '100px', 
                  height: '5px', 
                  backgroundColor: '#333', 
                  borderRadius: '3px', 
                  margin: '10px auto 0' 
                }}></div>
              </div>
            )}
            
            {embedType === 'responsive' && (
              <div style={{ 
                position: 'relative', 
                paddingBottom: '177.78%', 
                height: 0, 
                overflow: 'hidden', 
                maxWidth: '100%' 
              }}>
                <IframeEmbed 
                  url="https://mk-powerhouse.netlify.app/iframe.html" 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%' 
                  }} 
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-[#1A1F2E]/80 rounded-xl border border-[#0AE7F2]/20 p-6">
          <h2 className="text-xl font-bold mb-4">تعليمات التضمين</h2>
          
          <div className="space-y-4 text-gray-300">
            <p>1. انسخ كود التضمين أعلاه.</p>
            <p>2. الصق الكود في صفحة موقعك حيث تريد أن يظهر التطبيق.</p>
            <p>3. يمكنك تعديل العرض والارتفاع حسب احتياجاتك.</p>
            <p>4. للحصول على أفضل تجربة، نوصي باستخدام خيار "محاكاة هاتف محمول" للمواقع العادية وخيار "متجاوب مع الشاشة" للمواقع المتجاوبة.</p>
          </div>
          
          <div className="mt-6">
            <button
              onClick={onBack}
              className="bg-[#0AE7F2] text-black px-6 py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors"
            >
              العودة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}