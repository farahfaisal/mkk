import React, { useState } from 'react';
import { ArrowLeft, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from './BottomNav';

interface CaloriesRateProps {
  onBack: () => void;
}

export function CaloriesRate({ onBack }: CaloriesRateProps) {
  const navigate = useNavigate();
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState(1.2);
  const [bmr, setBmr] = useState(0);
  const [tdee, setTdee] = useState(0);

  const handleBack = () => {
    navigate('/trainee/weight');
  };

  const activityLevels = [
    { id: 1, label: 'منخفض', value: 1.2, active: true },
    { id: 2, label: 'متوسط', value: 1.55, active: false },
    { id: 3, label: 'مرتفع', value: 1.9, active: false },
  ];

  const calculateResults = () => {
    // Calculate BMR using Mifflin-St Jeor Equation
    let calculatedBmr;
    if (gender === 'male') {
      calculatedBmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      calculatedBmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    const roundedBmr = Math.round(calculatedBmr);
    setBmr(roundedBmr);
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const calculatedTdee = Math.round(roundedBmr * activityLevel);
    setTdee(calculatedTdee);
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
        <div className="flex items-center justify-between px-6 py-4 bg-[#1A1F2E]/80 backdrop-blur-lg">
          <button onClick={handleBack} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">حاسبة معدل الحرق!</h1>
          <div className="w-6"></div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            {/* Gender Selection */}
            <div>
              <label className="block text-sm mb-2">الجنس:</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 rounded-xl ${
                    gender === 'male'
                      ? 'bg-[#0AE7F2] text-black'
                      : 'bg-[#1A1F2E]/60 text-gray-400'
                  }`}
                >
                  ذكر
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 rounded-xl ${
                    gender === 'female'
                      ? 'bg-[#0AE7F2] text-black'
                      : 'bg-[#1A1F2E]/60 text-gray-400'
                  }`}
                >
                  أنثى
                </button>
              </div>
            </div>

            {/* Age Input */}
            <div>
              <label className="block text-sm mb-2">العمر:</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl p-3 text-center"
              />
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-sm mb-2">الوزن (كجم):</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl p-3 text-center"
              />
            </div>

            {/* Height Input */}
            <div>
              <label className="block text-sm mb-2">الطول (سم):</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl p-3 text-center"
              />
            </div>

            {/* Activity Level */}
            <div>
              <h2 className="text-lg mb-4">مستوى النشاط:</h2>
              <div className="flex justify-between gap-4">
                {activityLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setActivityLevel(level.value)}
                    className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center border-2 ${
                      activityLevel === level.value
                        ? 'border-[#0AE7F2] text-[#0AE7F2]'
                        : 'border-gray-600 text-gray-400'
                    }`}
                  >
                    <span className="text-2xl font-bold">{level.id}</span>
                    <span className="text-sm">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateResults}
              className="w-full bg-[#0AE7F2] text-black py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#0AE7F2]/90 transition-colors"
            >
              <Calculator size={20} />
              <span>احسب معدل الحرق</span>
            </button>

            {/* Results */}
            <div className="space-y-4">
              {/* BMR Result */}
              <div className="bg-[#1A1F2E]/60 backdrop-blur-sm p-6 rounded-xl border border-[#0AE7F2]/20">
                <h3 className="text-lg font-bold mb-2">معدل الأيض الأساسي (BMR)</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#0AE7F2]">{bmr}</span>
                  <span className="text-gray-400">سعرة/يوم</span>
                </div>
              </div>

              {/* TDEE Result */}
              <div className="bg-[#1A1F2E]/60 backdrop-blur-sm p-6 rounded-xl border border-[#0AE7F2]/20">
                <h3 className="text-lg font-bold mb-2">إجمالي الحرق اليومي (TDEE)</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#0AE7F2]">{tdee}</span>
                  <span className="text-gray-400">سعرة/يوم</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}