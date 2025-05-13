import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { WeeklySchedule } from './WeeklySchedule';
import { WeeklyMealSchedule } from './WeeklyMealSchedule';

interface TraineeScheduleModalProps {
  traineeId: string;
  traineeName: string;
  onClose: () => void;
}

export function TraineeScheduleModal({ traineeId, traineeName, onClose }: TraineeScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<'exercises' | 'meals'>('exercises');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#0AE7F2]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#0AE7F2]/10 p-3 rounded-xl">
                <Calendar size={24} className="text-[#0AE7F2]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">جدول {traineeName}</h2>
                <p className="text-sm text-gray-400">تعيين التمارين والوجبات</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('exercises')}
              className={`flex-1 py-3 rounded-xl transition-colors ${
                activeTab === 'exercises'
                  ? 'bg-[#0AE7F2] text-black'
                  : 'bg-[#0A0F1C]/40 text-gray-400 hover:text-white'
              }`}
            >
              التمارين
            </button>
            <button
              onClick={() => setActiveTab('meals')}
              className={`flex-1 py-3 rounded-xl transition-colors ${
                activeTab === 'meals'
                  ? 'bg-[#0AE7F2] text-black'
                  : 'bg-[#0A0F1C]/40 text-gray-400 hover:text-white'
              }`}
            >
              الوجبات
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'exercises' ? (
            <WeeklySchedule traineeId={traineeId} />
          ) : (
            <WeeklyMealSchedule traineeId={traineeId} />
          )}
        </div>
      </div>
    </div>
  );
}