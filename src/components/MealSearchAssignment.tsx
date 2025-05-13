import React, { useState, useEffect } from 'react';
import { Search, X, Check, Filter, ArrowLeft, Loader2, Apple, UtensilsCrossed, Moon, Cookie } from 'lucide-react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface MealSearchAssignmentProps {
  onBack: () => void;
  onAssign?: (mealId: string, mealName?: string) => void;
  traineeId?: string;
  dayOfWeek?: number;
  timing?: string;
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
  category: string;
}

export function MealSearchAssignment({ onBack, onAssign, traineeId, dayOfWeek, timing }: MealSearchAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const categories = [
    { id: 'breakfast', name: 'فطور', icon: Apple },
    { id: 'lunch', name: 'غداء', icon: UtensilsCrossed },
    { id: 'dinner', name: 'عشاء', icon: Moon },
    { id: 'snack', name: 'وجبات خفيفة', icon: Cookie }
  ];

  useEffect(() => {
    fetchMeals();
  }, []);

  useEffect(() => {
    filterMeals();
  }, [searchQuery, selectedCategory, meals]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setMeals(data || []);
        setFilteredMeals(data || []);
      } else {
        // Mock data for development
        const mockMeals = [
          {
            id: '1',
            name: 'شوفان بالموز واللوز',
            calories: 350,
            protein: 12,
            carbs: 45,
            fat: 14,
            description: 'شوفان مطبوخ مع حليب لوز، موز طازج، ولوز مقطع. غني بالألياف والبروتين.',
            category: 'breakfast'
          },
          {
            id: '2',
            name: 'سلطة دجاج مشوي',
            calories: 450,
            protein: 35,
            carbs: 20,
            fat: 25,
            description: 'صدر دجاج مشوي مع خضروات طازجة وصلصة زيت الزيتون. وجبة متوازنة وغنية بالبروتين.',
            category: 'lunch'
          },
          {
            id: '3',
            name: 'سمك سلمون مشوي',
            calories: 550,
            protein: 40,
            carbs: 35,
            fat: 30,
            description: 'سمك سلمون مشوي مع الخضروات المشوية وأرز بني. غني بأوميغا 3 والبروتين.',
            category: 'dinner'
          },
          {
            id: '4',
            name: 'زبادي يوناني مع التوت',
            calories: 180,
            protein: 15,
            carbs: 20,
            fat: 5,
            description: 'زبادي يوناني مع توت طازج وعسل. غني بالبروتين والبروبيوتيك.',
            category: 'snack'
          },
          {
            id: '5',
            name: 'بيض مسلوق مع خبز',
            calories: 320,
            protein: 18,
            carbs: 30,
            fat: 16,
            description: 'بيضتان مسلوقتان مع خبز أسمر وأفوكادو. غني بالبروتين والدهون الصحية.',
            category: 'breakfast'
          },
          {
            id: '6',
            name: 'عدس مع أرز',
            calories: 400,
            protein: 20,
            carbs: 60,
            fat: 8,
            description: 'عدس مطبوخ مع أرز بني وخضروات. غني بالبروتين النباتي والألياف.',
            category: 'lunch'
          }
        ];
        setMeals(mockMeals);
        setFilteredMeals(mockMeals);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('حدث خطأ أثناء تحميل الوجبات');
    } finally {
      setLoading(false);
    }
  };

  const filterMeals = () => {
    let filtered = [...meals];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (meal.description && meal.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(meal => meal.category === selectedCategory);
    }
    
    setFilteredMeals(filtered);
  };

  const handleAssignMeal = async () => {
    if (!selectedMeal || !onAssign) return;
    
    try {
      setAssigning(true);
      
      // Find the selected meal to get its name
      const meal = meals.find(m => m.id === selectedMeal);
      if (!meal) throw new Error('الوجبة غير موجودة');
      
      // Call the onAssign callback with the meal ID and name
      onAssign(selectedMeal, meal.name);
      
      // Close the component
      onBack();
    } catch (err) {
      console.error('Error assigning meal:', err);
      setError('حدث خطأ أثناء تعيين الوجبة');
    } finally {
      setAssigning(false);
    }
  };

  const getCategoryName = (category: string) => {
    const found = categories.find(c => c.id === category);
    return found ? found.name : category;
  };

  const getCategoryIcon = (category: string) => {
    const found = categories.find(c => c.id === category);
    return found ? found.icon : Apple;
  };

  return (
    <div className="fixed inset-0 bg-[#0A0F1C] text-white z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#0AE7F2]/20 bg-[#1A1F2E]/80 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
          >
            <ArrowLeft size={20} className="text-[#0AE7F2]" />
          </button>
          <h1 className="text-xl font-bold">بحث عن وجبة</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
          >
            <Filter size={20} className="text-[#0AE7F2]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن وجبة..."
              className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#0AE7F2]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0AE7F2]" size={20} />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex gap-2 overflow-x-auto py-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
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
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id 
                    ? 'bg-[#0AE7F2] text-black' 
                    : 'bg-[#1A1F2E]/60 text-gray-400'
                }`}
              >
                <category.icon size={16} />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content - Meal List */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-4">
            {error}
            <button 
              onClick={fetchMeals}
              className="underline hover:no-underline mt-2 block w-full"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={40} className="text-[#0AE7F2] animate-spin" />
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-[#0AE7F2]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-[#0AE7F2]" />
            </div>
            <h3 className="text-lg font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-gray-400">لم يتم العثور على وجبات تطابق بحثك</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMeals.map((meal) => {
              const CategoryIcon = getCategoryIcon(meal.category);
              return (
                <button
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal.id)}
                  className={`w-full p-4 rounded-xl text-right transition-colors ${
                    selectedMeal === meal.id
                      ? 'bg-[#0AE7F2]/20 border-[#0AE7F2] text-white'
                      : 'bg-[#1A1F2E]/60 border-[#0AE7F2]/20 hover:bg-[#1A1F2E]'
                  } border`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#0AE7F2]/10 p-2 rounded-lg">
                        <CategoryIcon size={20} className="text-[#0AE7F2]" />
                      </div>
                      <div className="text-right">
                        <h3 className="font-medium">{meal.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-[#0AE7F2]">{meal.calories} سعرة</span>
                          <span className="text-xs text-gray-400">{getCategoryName(meal.category)}</span>
                        </div>
                      </div>
                    </div>
                    {selectedMeal === meal.id && (
                      <div className="bg-[#0AE7F2] text-black p-2 rounded-full">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                  
                  {meal.description && (
                    <p className="text-sm text-gray-400 mt-2 pr-10">{meal.description}</p>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 pr-10">
                    <div className="text-xs">
                      <span className="text-[#0AE7F2]">{meal.protein}g</span>
                      <span className="text-gray-400 mr-1">بروتين</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[#0AE7F2]">{meal.carbs}g</span>
                      <span className="text-gray-400 mr-1">كربوهيدرات</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[#0AE7F2]">{meal.fat}g</span>
                      <span className="text-gray-400 mr-1">دهون</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer - Assign Button */}
      <div className="p-4 border-t border-[#0AE7F2]/20 bg-[#1A1F2E]/80 backdrop-blur-lg">
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleAssignMeal}
            disabled={!selectedMeal || assigning}
            className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {assigning ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>جاري التعيين...</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>تعيين الوجبة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}