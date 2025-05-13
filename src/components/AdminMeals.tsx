import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Apple } from 'lucide-react';
import { AddMealForm } from './AddMealForm';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  status: string;
  description?: string;
}

export function AdminMeals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMeals(data || []);
      } else {
        setMeals([
          {
            id: '1',
            name: 'شوفان بالموز',
            calories: 350,
            protein: 12,
            carbs: 45,
            fat: 8,
            category: 'breakfast',
            status: 'active',
            description: 'وجبة فطور صحية غنية بالألياف'
          },
          {
            id: '2',
            name: 'صدر دجاج مشوي',
            calories: 450,
            protein: 35,
            carbs: 20,
            fat: 15,
            category: 'lunch',
            status: 'active',
            description: 'وجبة غداء غنية بالبروتين'
          },
          {
            id: '3',
            name: 'سلمون مشوي',
            calories: 400,
            protein: 30,
            carbs: 15,
            fat: 20,
            category: 'dinner',
            status: 'active',
            description: 'وجبة عشاء صحية غنية بالأوميغا 3'
          },
          {
            id: '4',
            name: 'سلطة خضراء',
            calories: 150,
            protein: 5,
            carbs: 20,
            fat: 8,
            category: 'lunch',
            status: 'active',
            description: 'سلطة خضراء طازجة'
          },
          {
            id: '5',
            name: 'عصير بروتين',
            calories: 200,
            protein: 25,
            carbs: 15,
            fat: 5,
            category: 'snack',
            status: 'active',
            description: 'مشروب بروتين للتعافي بعد التمرين'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الوجبات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (mealData: any) => {
    try {
      setLoading(true);
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from('meals')
          .insert([{
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            description: mealData.description,
            category: mealData.category,
            status: 'active'
          }])
          .select()
          .single();

        if (error) throw error;
        setMeals(prev => [data, ...prev]);
      } else {
        const newMeal = {
          id: Date.now().toString(),
          name: mealData.name,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fat: mealData.fat,
          description: mealData.description,
          category: mealData.category,
          status: 'active'
        };
        setMeals(prev => [newMeal, ...prev]);
      }
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('حدث خطأ أثناء إضافة الوجبة');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowAddForm(true);
  };

  const handleUpdateMeal = async (mealData: any) => {
    if (!editingMeal) return;
    try {
      setLoading(true);
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from('meals')
          .update({
            name: mealData.name,
            calories: mealData.calories,
            protein: mealData.protein,
            carbs: mealData.carbs,
            fat: mealData.fat,
            description: mealData.description,
            category: mealData.category
          })
          .eq('id', editingMeal.id);
        if (error) throw error;
      }
      setMeals(prev => prev.map(meal =>
        meal.id === editingMeal.id
          ? { ...meal, ...mealData }
          : meal
      ));
      setShowAddForm(false);
      setEditingMeal(null);
    } catch (error) {
      console.error('Error updating meal:', error);
      alert('حدث خطأ أثناء تحديث الوجبة');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوجبة؟')) return;
    try {
      setLoading(true);
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from('meals')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      setMeals(prev => prev.filter(meal => meal.id !== id));
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('حدث خطأ أثناء حذف الوجبة');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'breakfast': return 'الفطور';
      case 'lunch': return 'الغداء';
      case 'dinner': return 'العشاء';
      case 'snack': return 'وجبة خفيفة';
      default: return category;
    }
  };

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(meal.category).includes(searchQuery)
  );

  return (
    <div className="bg-[#1A1F2E] rounded-xl border border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">الوجبات</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Filter size={16} className="text-white/60" />
            </button>
            <button
              onClick={() => {
                setEditingMeal(null);
                setShowAddForm(true);
              }}
              className="bg-[#0AE7F2] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>إضافة وجبة</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث عن وجبة..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#0AE7F2]/50 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[70vh] px-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
              {error}
              <button
                onClick={fetchMeals}
                className="underline hover:no-underline mt-2 block w-full"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            لا توجد وجبات
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الوجبة</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-white/60">التصنيف</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-white/60">السعرات</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-white/60">البروتين</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الكربوهيدرات</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الدهون</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-white/60"></th>
              </tr>
            </thead>
            <tbody>
              {filteredMeals.map((meal) => (
                <tr key={meal.id} className="border-b border-white/10 last:border-0">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0AE7F2]/10 rounded-lg flex items-center justify-center">
                        <Apple size={16} className="text-[#0AE7F2]" />
                      </div>
                      <div>
                        <span className="font-medium">{meal.name}</span>
                        {meal.description && (
                          <p className="text-xs text-gray-400 mt-1">{meal.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{getCategoryName(meal.category)}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{meal.calories}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{meal.protein}g</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{meal.carbs}g</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{meal.fat}g</span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditMeal(meal)}
                        className="p-1 hover:bg-[#0AE7F2]/10 rounded transition-colors text-[#0AE7F2]"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-1 hover:bg-rose-500/10 rounded transition-colors text-rose-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddForm && (
        <AddMealForm
          onClose={() => {
            setShowAddForm(false);
            setEditingMeal(null);
          }}
          onSubmit={editingMeal ? handleUpdateMeal : handleAddMeal}
          initialData={editingMeal || undefined}
        />
      )}
    </div>
  );
}
