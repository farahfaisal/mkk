import React from 'react';
import { X, ArrowLeft, Clock } from 'lucide-react';

interface AlternativeMealsProps {
  onClose: () => void;
  originalMeal: {
    name: string;
    calories: number;
  };
}

interface AlternativeMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  preparationTime: string;
}

export function AlternativeMeals({ onClose, originalMeal }: AlternativeMealsProps) {
  // Mock data - replace with actual data from your backend
  const alternativeMeals: AlternativeMeal[] = [
    {
      id: '1',
      name: 'فطور',
      calories: 400,
      protein: 12,
      carbs: 45,
      fat: 8,
      description: 'شوفان مع موز طازج وعسل غني بالألياف والبروتين',
      preparationTime: '10 دقائق'
    },
    {
      id: '2',
      name: 'فطور',
      calories: 450,
      protein: 15,
      carbs: 40,
      fat: 10,
      description: 'خبز محمص مع أفوكادو مهروس وبيض مسلوق',
      preparationTime: '15 دقائق'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0A0F1C] w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col mx-4 rounded-3xl">
        {/* Header */}
        <div className="p-4 border-b border-[#0AE7F2]/20 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0AE7F2]/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <h2 className="text-xl font-bold">بدائل {originalMeal.name}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0AE7F2]/10 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Original Meal */}
        <div className="p-4 bg-[#1A1F2E]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">الوجبة الأصلية</h3>
            <span className="text-[#0AE7F2]">{originalMeal.calories} سعرة</span>
          </div>
          <p className="text-sm text-gray-400">{originalMeal.name}</p>
        </div>

        {/* Alternative Meals List */}
        <div className="flex-1 overflow-y-auto">
          {alternativeMeals.map((meal) => (
            <div 
              key={meal.id}
              className="p-6 border-b border-[#0AE7F2]/10 hover:bg-[#1A1F2E] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-[#0AE7F2] mb-1">{meal.calories} سعرة</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={16} />
                    <span>{meal.preparationTime}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-6">{meal.description}</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1A1F2E]/40 rounded-xl p-3 text-center">
                  <span className="text-sm font-medium text-[#0AE7F2]">{meal.protein}g</span>
                  <p className="text-xs text-gray-400">بروتين</p>
                </div>
                <div className="bg-[#1A1F2E]/40 rounded-xl p-3 text-center">
                  <span className="text-sm font-medium text-[#0AE7F2]">{meal.carbs}g</span>
                  <p className="text-xs text-gray-400">كربوهيدرات</p>
                </div>
                <div className="bg-[#1A1F2E]/40 rounded-xl p-3 text-center">
                  <span className="text-sm font-medium text-[#0AE7F2]">{meal.fat}g</span>
                  <p className="text-xs text-gray-400">دهون</p>
                </div>
              </div>
            </div>
          ))}

          {/* Empty Space for Better Scrolling */}
          <div className="h-6"></div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#0AE7F2]/20">
          <button 
            onClick={onClose}
            className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-medium hover:bg-[#0AE7F2]/90 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}