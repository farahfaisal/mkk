import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface VideoSplashScreenProps {
  onFinish: () => void;
  videoUrl?: string;
}

export function VideoSplashScreen({ onFinish, videoUrl = "https://souqpale.com/wp-content/uploads/2025/05/WhatsApp-Video-2025-05-06-at-16.52.50.mp4" }: VideoSplashScreenProps) {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setTimeout(() => {
        onFinish();
      }, 500);
    };

    const handleCanPlay = () => {
      setLoading(false);
      video.play().catch(err => {
        console.error('Error playing video:', err);
        // Fallback if autoplay is blocked
        setTimeout(() => {
          onFinish();
        }, 2000);
      });
    };

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('canplay', handleCanPlay);

    // Fallback in case video doesn't load or play
    const timeout = setTimeout(() => {
      onFinish();
    }, 8000);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('canplay', handleCanPlay);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-[#0A0F1C] flex flex-col items-center justify-center z-50">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <img 
            src="https://souqpale.com/wp-content/uploads/2025/03/تصميم-بدون-عنوان-9.png" 
            alt="Logo"
            className="w-32 h-32 object-contain mb-4"
          />
          <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          preload="auto"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>
    </div>
  );
}