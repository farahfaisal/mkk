import React, { useState } from 'react';
import { TraineeLogin } from './TraineeLogin';
import { SplashScreen } from './SplashScreen';
import { VideoSplashScreen } from './VideoSplashScreen';
import { useNavigate } from 'react-router-dom';

interface TraineeLoginWithSplashProps {
  onRegister: () => void;
  onSuccess: () => void;
}

export function TraineeLoginWithSplash({ onRegister, onSuccess }: TraineeLoginWithSplashProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [showVideoSplash, setShowVideoSplash] = useState(true);
  const navigate = useNavigate();

  const handleVideoSplashFinish = () => {
    setShowVideoSplash(false);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleRegister = () => {
    navigate('/trainee/register');
  };

  if (showVideoSplash) {
    return <VideoSplashScreen onFinish={handleVideoSplashFinish} />;
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return <TraineeLogin onRegister={handleRegister} onSuccess={onSuccess} />;
}