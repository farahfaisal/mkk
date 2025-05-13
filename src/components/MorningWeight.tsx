import React, { useState, useEffect } from 'react';
import { ArrowLeft, Scale, Plus, Minus, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { submitWeeklyWeight, updateTraineeWeight } from '../lib/api/weight';
import { BottomNav } from './BottomNav';

interface MorningWeightProps {
  onBack: () => void;
  onCaloriesRateClick: () => void;
}

export function MorningWeight({ onBack, onCaloriesRateClick }: MorningWeightProps) {
  const navigate = useNavigate();
  const [weight, setWeight] = useState(70);
  const [calories] = useState(2228);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tempWeight, setTempWeight] = useState(weight);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWeight, setStartWeight] = useState(0);

  useEffect(() => {
    // Load weight from localStorage if available
    const storedProfile = localStorage.getItem('traineeProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        if (profile.weight) {
          setWeight(profile.weight);
          setTempWeight(profile.weight);
        }
      } catch (e) {
        console.error('Error parsing stored profile:', e);
      }
    }
  }, []);

  const handleBack = () => {
    navigate('/trainee');
  };

  const handleCaloriesRateClick = () => {
    navigate('/trainee/calories');
  };

  const handleWeightChange = (value: number) => {
    const newWeight = Math.min(Math.max(30, Number(value.toFixed(1))), 200);
    setTempWeight(newWeight);
    setWeight(newWeight);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartWeight(weight);
  };

  const handleMouseStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
    setStartWeight(weight);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = startX - e.touches[0].clientX;
    const weightChange = deltaX * 0.15;
    handleWeightChange(startWeight - weightChange);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = startX - e.clientX;
    const weightChange = deltaX * 0.15;
    handleWeightChange(startWeight - weightChange);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleSaveWeight = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update weight in database
      await updateTraineeWeight(tempWeight);
      
      setWeight(tempWeight);
      setShowEditModal(false);
      setSuccess('تم تحديث الوزن بنجاح');
    } catch (error) {
      console.error('Error updating weight:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الوزن');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWeight = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Submit weight to database
      await submitWeeklyWeight(weight);
      setSuccess('تم إرسال الوزن بنجاح!');
    } catch (error) {
      console.error('Error submitting weight:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الوزن');
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorPosition = () => {
    const minWeight = 30;
    const maxWeight = 200;
    const position = ((weight - minWeight) / (maxWeight - minWeight)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getLineStyle = (index: number) => {
    const indicatorPosition = getIndicatorPosition();
    const linePosition = (index / 49) * 100;
    const distance = Math.abs(linePosition - indicatorPosition);
    const maxRange = 20;
    
    if (distance <= maxRange) {
      const influence = 1 - (distance / maxRange);
      const minHeight = 32;
      const maxHeight = 48;
      const height = minHeight + (maxHeight - minHeight) * influence;
      const opacity = 0.3 + (0.7 * influence);
      
      return {
        height: `${height}px`,
        backgroundColor: `rgba(10, 231, 242, ${opacity})`
      };
    }

    return {
      height: '32px',
      backgroundColor: 'rgba(10, 231, 242, 0.3)'
    };
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white">
      {/* Background */}
      <div className="bg-base internal-bg">
        <div className="bg-overlay">
          <div className="bg-pattern" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="header-base">
          <div className="flex items-center justify-between">
            <button onClick={handleBack} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">وزنك الحالي</h1>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto content-container">
          <div className="space-y-6">
            {/* Status Messages */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-4 rounded-xl text-center">
                {success}
              </div>
            )}

            {/* Weight Display */}
            <div className="text-center">
              <div className="inline-block">
                <h2 className="text-[#0AE7F2] text-6xl font-bold mb-2">{weight.toFixed(1)} Kg</h2>
              </div>
            </div>

            {/* Weight Scale Visualization */}
            <div className="card-base">
              <div 
                className="h-16 flex items-center justify-center cursor-pointer select-none touch-none relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDragEnd}
                onMouseDown={handleMouseStart}
                onMouseMove={handleMouseMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
              >
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-[#0AE7F2] rounded-full transition-all duration-200 z-10 shadow-[0_0_10px_rgba(10,231,242,0.5)]"
                  style={{ left: `${getIndicatorPosition()}%` }}
                />

                <div className="w-full flex items-center justify-center space-x-1 rtl:space-x-reverse">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 transition-all duration-200"
                      style={getLineStyle(i)}
                    />
                  ))}
                </div>
              </div>
              <p className="text-center text-sm text-gray-400 mt-2">
                اسحب يميناً أو يساراً لتعديل الوزن
              </p>
            </div>

            {/* Instructions */}
            <div className="text-center">
              <p className="text-gray-400 text-lg">
                الرجاء إرسال وزنك كل يوم أحد من خلال
                <br />
                الضغط على زر <span className="text-[#0AE7F2]">الإرسال</span> بالأسفل
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={handleSubmitWeight}
                disabled={loading}
                className="flex-1 bg-black/60 backdrop-blur-sm border-[1.5px] border-[#0AE7F2] hover:border-[#0AE7F2]/80 text-[#0AE7F2] py-4 rounded-2xl font-medium disabled:opacity-50 transition-colors text-lg"
              >
                {loading ? 'جاري الإرسال...' : 'أرسل وزني!'}
              </button>
              <button 
                onClick={() => {
                  setTempWeight(weight);
                  setShowEditModal(true);
                }}
                disabled={loading}
                className="flex-1 bg-[#0AE7F2] text-black py-4 rounded-2xl font-medium disabled:opacity-50 hover:bg-[#0AE7F2]/90 transition-colors text-lg"
              >
                تحديث وزني!
              </button>
            </div>

            {/* Calories Card */}
            <button 
              onClick={handleCaloriesRateClick}
              className="w-full card-base cursor-pointer hover:bg-[#1A1F2E]/80 transition-colors"
            >
              <h3 className="text-xl font-bold mb-4">معدل الحرق!</h3>
              <div className="flex items-center justify-center bg-black/40 rounded-2xl p-4">
                <div className="text-[#0AE7F2] mr-2">
                  <Flame size={32} className="drop-shadow-[0_0_8px_rgba(10,231,242,0.5)]" />
                </div>
                <div className="text-center">
                  <p className="text-[#0AE7F2] text-2xl font-bold">{calories}</p>
                  <p className="text-sm text-gray-400">Kcal</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Weight Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1F2E] rounded-2xl p-6 w-[90%] max-w-md mx-4">
            <h3 className="text-xl font-bold mb-6 text-center">تحديث الوزن</h3>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <button 
                onClick={() => handleWeightChange(tempWeight - 0.1)}
                className="w-12 h-12 rounded-full bg-[#0AE7F2]/10 text-[#0AE7F2] flex items-center justify-center hover:bg-[#0AE7F2]/20 transition-colors"
                disabled={loading}
              >
                <Minus size={24} className="drop-shadow-[0_0_8px_rgba(10,231,242,0.5)]" />
              </button>
              
              <div className="text-center">
                <input
                  type="number"
                  value={tempWeight}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
                  className="w-24 bg-transparent text-center text-4xl font-bold text-[#0AE7F2] focus:outline-none"
                  step="0.1"
                  disabled={loading}
                />
                <p className="text-gray-400">Kg</p>
              </div>

              <button 
                onClick={() => handleWeightChange(tempWeight + 0.1)}
                className="w-12 h-12 rounded-full bg-[#0AE7F2]/10 text-[#0AE7F2] flex items-center justify-center hover:bg-[#0AE7F2]/20 transition-colors"
                disabled={loading}
              >
                <Plus size={24} className="drop-shadow-[0_0_8px_rgba(10,231,242,0.5)]" />
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveWeight}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}