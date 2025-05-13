import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Clock, Apple, UtensilsCrossed, Moon, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface FullMenuProps {
  onBack: () => void;
}

interface MealProgram {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timing: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function FullMenu({ onBack }: FullMenuProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mealPrograms, setMealPrograms] = useState<MealProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<string>('');

  useEffect(() => {
    fetchMeals();
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    setCurrentDay(days[new Date().getDay()]);
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const dayOfWeek = new Date().getDay();

      if (isSupabaseConnected()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }

        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const weekStartDate = startOfWeek.toISOString().split('T')[0];

        const { data: schedule, error: scheduleError } = await supabase
          .from('weekly_schedules')
          .select('id')
          .eq('trainee_id', user.id)
          .eq('week_start_date', weekStartDate)
          .single();

        if (scheduleError && scheduleError.code !== 'PGRST116') {
          throw scheduleError;
        }

        if (!schedule) {
          setMealPrograms([]);
          return;
        }

        const { data: mealData, error: mealsError } = await supabase
          .from('schedule_meals')
          .select(`
            id,
            meal_id,
            timing,
            status,
            consumed_at,
            meals (
              id,
              name,
              calories,
              protein,
              carbs,
              fat,
              description,
              category
            )
          `)
          .eq('schedule_id', schedule.id)
          .eq('day_of_week', dayOfWeek);

        if (mealsError) {
          throw mealsError;
        }

        if (mealData && mealData.length > 0) {
          const formattedMeals = mealData.map(meal => ({
            id: meal.meals.id,
            name: meal.meals.name,
            description: meal.meals.description || '',
            calories: meal.meals.calories,
            protein: meal.meals.protein,
            carbs: meal.meals.carbs,
            fat: meal.meals.fat,
            timing: getTimingHours(meal.timing),
            category: meal.meals.category as 'breakfast' | 'lunch' | 'dinner' | 'snack'
          }));

          setMealPrograms(formattedMeals);
        } else {
          setMealPrograms([]);
        }
      } else {
        throw new Error('لم يتم الاتصال بقاعدة البيانات');
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('حدث خطأ أثناء تحميل الوجبات');
      setMealPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimingHours = (timing: string): string => {
    switch (timing) {
      case 'breakfast': return '7:00 - 9:00';
      case 'lunch': return '12:00 - 14:00';
      case 'dinner': return '18:00 - 20:00';
      case 'snack': return '10:00 - 16:00';
      default: return timing;
    }
  };

  const categories = [
    { id: 'breakfast', name: 'فطور', icon: Apple },
    { id: 'lunch', name: 'غداء', icon: UtensilsCrossed },
    { id: 'dinner', name: 'عشاء', icon: Moon },
    { id: 'snack', name: 'وجبات خفيفة', icon: Cookie }
  ];

  const getCategoryName = (category: string) => {
    const found = categories.find(c => c.id === category);
    return found ? found.name : category;
  };

  const getCategoryIcon = (category: string) => {
    const found = categories.find(c => c.id === category);
    return found ? found.icon : Apple;
  };

  const filteredMeals = mealPrograms.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           meal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || meal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white">
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <button onClick={handleBack} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">وجبات يوم {currentDay}</h1>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
            >
              <Filter size={20} className="text-[#0AE7F2]" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن وجبة..."
                className="w-full py-2 px-4 bg-[#1A1F2E]/60 rounded-xl border border-[#0AE7F2]/20 focus:outline-none"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0AE7F2]" size={20} />
            </div>

            {showFilters && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap ${
                    !selectedCategory 
                      ? 'bg-[#0AE7F2] text-black' 
                      : 'bg-[#1A1F2E]/60 text-gray-400'
                  }`}
                >
                  الكل
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap ${
                      selectedCategory === category.id 
                        ? 'bg-[#0AE7F2] text-black' 
                        : 'bg-[#1A1F2E]/60 text-gray-400'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-rose-500">{error}</div>
          ) : filteredMeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-[#0AE7F2]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-[#0AE7F2]" />
              </div>
              <h3 className="text-lg font-bold mb-2">لا توجد وجبات</h3>
              <p className="text-gray-400">لا توجد وجبات مسجلة لهذا اليوم</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeals.map(meal => {
                const CategoryIcon = getCategoryIcon(meal.category);
                return (
                  <div key={meal.id} className="p-4 bg-[#1A1F2E] rounded-xl border border-[#0AE7F2]/20">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-bold mb-2">{meal.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock size={16} />
                          <span>{meal.timing}</span>
                        </div>
                      </div>
                      <span className="bg-[#0AE7F2]/10 text-[#0AE7F2] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                        <CategoryIcon size={16} />
                        <span>{getCategoryName(meal.category)}</span>
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4">{meal.description}</p>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <span className="text-lg font-bold text-[#0AE7F2]">{meal.calories}</span>
                        <p className="text-xs text-gray-400">سعرة</p>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-bold text-[#0AE7F2]">{meal.protein}g</span>
                        <p className="text-xs text-gray-400">بروتين</p>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-bold text-[#0AE7F2]">{meal.carbs}g</span>
                        <p className="text-xs text-gray-400">كربوهيدرات</p>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-bold text-[#0AE7F2]">{meal.fat}g</span>
                        <p className="text-xs text-gray-400">دهون</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
