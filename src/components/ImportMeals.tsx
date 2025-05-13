import React, { useState } from 'react';
import { ArrowLeft, Share2, Plus, Save } from 'lucide-react';
import { NutritionSearch } from './NutritionSearch';
import { addMeal } from '../lib/api/meals';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface ImportMealsProps {
  onBack: () => void;
}

interface ImportedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function ImportMeals({ onBack }: ImportMealsProps) {
  const [importedMeals, setImportedMeals] = useState<ImportedMeal[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFoodSelect = (food: any) => {
    const newMeal: ImportedMeal = {
      id: food.id || String(Date.now()),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat
    };
    
    setImportedMeals(prev => [...prev, newMeal]);
    setShowSearch(false);
  };

  const removeMeal = (id: string) => {
    setImportedMeals(prev => prev.filter(meal => meal.id !== id));
  };

  const getTotalNutrition = () => {
    return importedMeals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isSupabaseConnected()) {
        // Save to Supabase
        const { error } = await supabase!.from('meals').insert(
          importedMeals.map(meal => ({
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat
          }))
        );
        if (error) throw error;
      } else {
        // Save using mock API
        await Promise.all(
          importedMeals.map(meal => 
            addMeal({
              name: meal.name,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat
            })
          )
        );
      }
      
      // Clear imported meals after successful save
      setImportedMeals([]);
      alert('تم حفظ الوجبات بنجاح!');
      onBack();
    } catch (error) {
      console.error('Error saving meals:', error);
      alert('حدث خطأ أثناء حفظ الوجبات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0F1C] text-white">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0A0F1C]/90"></div>
      </div>

      <div className="relative z-10 pb-24">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <button onClick={onBack} className="text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">استيراد وجبات</h1>
          <button className="text-white">
            <Share2 size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="px-6 space-y-6">
          {/* Search Button */}
          {!showSearch && (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full bg-[#00BFA6] text-white p-4 rounded-xl flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              <span>إضافة وجبة جديدة</span>
            </button>
          )}

          {/* Search Component */}
          {showSearch && (
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-2xl border border-[#00BFA6]/20 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">البحث عن وجبة</h2>
                <button 
                  onClick={() => setShowSearch(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>
              <NutritionSearch onSelectFood={handleFoodSelect} />
            </div>
          )}

          {/* Imported Meals List */}
          {importedMeals.length > 0 && (
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-2xl border border-[#00BFA6]/20 p-6">
              <h2 className="text-lg font-bold mb-4">الوجبات المستوردة</h2>
              <div className="space-y-4">
                {importedMeals.map((meal) => (
                  <div 
                    key={meal.id}
                    className="bg-[#1A1F2E]/40 rounded-xl p-4 flex justify-between items-start"
                  >
                    <div className="flex flex-col items-end">
                      <span className="font-medium mb-1">{meal.name}</span>
                      <div className="text-sm text-gray-400 flex gap-3">
                        <span>بروتين: {meal.protein}g</span>
                        <span>كربوهيدرات: {meal.carbs}g</span>
                        <span>دهون: {meal.fat}g</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[#00BFA6] font-medium">
                        {meal.calories} سعرة
                      </span>
                      <button 
                        onClick={() => removeMeal(meal.id)}
                        className="text-red-500 text-sm hover:text-red-400"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total Nutrition */}
                <div className="mt-6 pt-6 border-t border-[#00BFA6]/20">
                  <h3 className="text-lg font-bold mb-4">المجموع الكلي</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                      <span className="text-gray-400">السعرات الحرارية</span>
                      <p className="text-2xl font-bold text-[#00BFA6]">
                        {getTotalNutrition().calories}
                      </p>
                    </div>
                    <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                      <span className="text-gray-400">البروتين</span>
                      <p className="text-2xl font-bold text-[#00BFA6]">
                        {getTotalNutrition().protein}g
                      </p>
                    </div>
                    <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                      <span className="text-gray-400">الكربوهيدرات</span>
                      <p className="text-2xl font-bold text-[#00BFA6]">
                        {getTotalNutrition().carbs}g
                      </p>
                    </div>
                    <div className="bg-[#1A1F2E]/40 rounded-xl p-4">
                      <span className="text-gray-400">الدهون</span>
                      <p className="text-2xl font-bold text-[#00BFA6]">
                        {getTotalNutrition().fat}g
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#00BFA6] text-white p-4 rounded-xl flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ الوجبات'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}