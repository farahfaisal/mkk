import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, ClipboardList, Dumbbell, Footprints, Home, Bell, MessageCircle, User, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AllExercises } from './AllExercises';
import { ChestExercises } from './ChestExercises';
import { MyExercises } from './MyExercises';
import { Notifications } from './Notifications';
import { Chat } from './Chat';
import { DailySteps } from './DailySteps';
import { assets } from '../lib/config/assets';
import { BottomNav } from './BottomNav';
import { StepCounterWidget } from './StepCounterWidget';
import { TraineeSteps } from './TraineeSteps';

interface ExerciseProgramProps {
  onBack: () => void;
}

export function ExerciseProgram({ onBack }: ExerciseProgramProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'main' | 'all-exercises' | 'chest' | 'my-exercises' | 'notifications' | 'chat' | 'daily-steps'>('main');
  const [steps, setSteps] = useState(0);
  const [targetSteps, setTargetSteps] = useState(3000);

  useEffect(() => {
    // Fetch steps data
    const fetchSteps = async () => {
      try {
        // In a real app, this would fetch from your API
        const randomSteps = Math.floor(Math.random() * 2500) + 500;
        setSteps(randomSteps);
      } catch (error) {
        console.error('Error fetching steps:', error);
      }
    };

    fetchSteps();
  }, []);

  const handleBack = () => {
    if (currentView !== 'main') {
      setCurrentView('main');
    } else {
      navigate('/trainee');
    }
  };

  const handleNavigation = (route: string) => {
    switch (route) {
      case 'home':
        navigate('/trainee');
        break;
      case 'notifications':
        navigate('/trainee/notifications');
        break;
      case 'messages':
        navigate('/trainee/chat');
        break;
      case 'profile':
        navigate('/trainee/profile');
        break;
      default:
        break;
    }
  };

  if (currentView === 'notifications') {
    return <Notifications onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'chat') {
    return <Chat onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'all-exercises') {
    return (
      <AllExercises 
        onBack={() => setCurrentView('main')}
        onChestClick={() => setCurrentView('chest')}
      />
    );
  }

  if (currentView === 'chest') {
    return (
      <ChestExercises
        onBack={() => setCurrentView('all-exercises')}
      />
    );
  }

  if (currentView === 'my-exercises') {
    return (
      <MyExercises
        onBack={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'daily-steps') {
    return (
      <TraineeSteps
        onBack={() => setCurrentView('main')}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white">
      {/* Background - Using solid color */}
      <div className="bg-base">
        <div className="bg-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header - Reduced padding */}
        <div className="bg-[#1A1F2E]/80 backdrop-blur-lg border-b border-[#0AE7F2]/20 py-2">
          <div className="flex justify-between items-center px-4">
            <button onClick={handleBack} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">برنامج تماريني!</h1>
            <button className="text-white">
              <Share2 size={24} />
            </button>
          </div>
        </div>

        {/* Main Content - Adjusted spacing */}
        <div className="flex-1 overflow-y-auto px-4 pt-2">
          {/* Center Icons Grid */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
            <div className="grid grid-cols-2 gap-4 max-w-[300px] mx-auto">
              {/* كل التمارين */}
              <button 
                onClick={() => setCurrentView('all-exercises')}
                className="relative w-[140px] h-[140px] flex flex-col items-center justify-center group"
              >
                <div className="absolute inset-0 bg-black/50 rounded-[28px] border-2 border-[#0ae7f2]" />
                <div className="relative text-[#0AE7F2] mb-2 h-16 flex items-center transition-transform duration-300 group-hover:scale-110">
                  <Dumbbell size={40} className="text-[#0AE7F2]" />
                </div>
                <span className="relative text-sm font-medium text-[#0AE7F2]">كل التمارين!</span>
              </button>

              {/* قائمة تماريني */}
              <button 
                onClick={() => setCurrentView('my-exercises')}
                className="relative w-[140px] h-[140px] flex flex-col items-center justify-center group"
              >
                <div className="absolute inset-0 bg-black/50 rounded-[28px] border-2 border-[#0ae7f2]" />
                <div className="relative text-[#0AE7F2] mb-2 h-16 flex items-center transition-transform duration-300 group-hover:scale-110">
                  <ClipboardList size={40} className="text-[#0AE7F2]" />
                </div>
                <span className="relative text-sm font-medium text-[#0AE7F2]">قائمة تماريني!</span>
              </button>

              {/* خطواتي اليومية */}
              <button 
                onClick={() => setCurrentView('daily-steps')}
                className="relative w-[140px] h-[140px] flex flex-col items-center justify-center group"
              >
                <div className="absolute inset-0 bg-black/50 rounded-[28px] border-2 border-[#0ae7f2]" />
                <div className="relative text-[#0AE7F2] mb-2 h-16 flex items-center">
                  <Footprints size={40} className="text-[#0AE7F2]" />
                </div>
                <div className="relative text-center">
                  <div className="text-sm font-medium text-[#0AE7F2] mb-1">خطواتي اليومية!</div>
                  <div className="text-sm text-[#0AE7F2]">{steps}</div>
                </div>
              </button>

              {/* خطوات المستهدفة */}
              <button 
                onClick={() => setCurrentView('daily-steps')}
                className="relative w-[140px] h-[140px] flex flex-col items-center justify-center group"
              >
                <div className="absolute inset-0 bg-black/50 rounded-[28px] border-2 border-[#0ae7f2]" />
                <div className="relative text-[#0AE7F2] mb-2 h-16 flex items-center">
                  <Target size={40} className="text-[#0AE7F2]" />
                </div>
                <div className="relative text-center">
                  <div className="text-sm font-medium text-[#0AE7F2] mb-1">خطوات المستهدفة!</div>
                  <div className="text-sm text-[#0AE7F2]">{targetSteps}</div>
                </div>
              </button>
            </div>

            {/* الصفحة الرئيسية Button */}
            <button 
              onClick={() => navigate('/trainee')}
              className="w-full max-w-[300px] mt-6 bg-black/50 backdrop-blur-sm rounded-[24px] border-2 border-[#0ae7f2] h-[50px] text-[#0AE7F2] text-sm font-medium hover:bg-black/60 transition-all"
            >
              الصفحة الرئيسية
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}