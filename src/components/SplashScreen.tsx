import React, { useRef, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeOut, setFadeOut] = useState(false);

  const handleVideoEnd = () => {
    // نوقف الفيديو فور انتهاءه
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setFadeOut(true);

    // ننتظر تأثير التلاشي ثم ننهي السبلش
    setTimeout(() => {
      onFinish();
    }, 500); // نصف ثانية للتلاشي
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      <video
        ref={videoRef}
        src="https://souqpale.com/wp-content/uploads/2025/05/WhatsApp-Video-2025-05-06-at-16.52.50.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* طبقة التلاشي فوق الفيديو */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          fadeOut ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
