import React, { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { dairyProducts } from '../lib/data/dairyProducts';

interface NutritionItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionSearchProps {
  onSelectFood: (food: NutritionItem) => void;
}

export function NutritionSearch({ onSelectFood }: NutritionSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NutritionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<any[]>([]);

  useEffect(() => {
    // Load nutrition data from mock database
    const mockNutritionData = [
      {
        id: 'food-1',
        name: 'شوفان بالموز',
        calories: 350,
        protein: 12,
        carbs: 45,
        fat: 8,
        category: 'breakfast'
      },
      {
        id: 'food-2',
        name: 'صدر دجاج مشوي',
        calories: 450,
        protein: 35,
        carbs: 20,
        fat: 15,
        category: 'lunch'
      },
      {
        id: 'food-3',
        name: 'سلمون مشوي',
        calories: 400,
        protein: 30,
        carbs: 15,
        fat: 20,
        category: 'dinner'
      },
      {
        id: 'food-4',
        name: 'سلطة خضراء',
        calories: 150,
        protein: 5,
        carbs: 20,
        fat: 8,
        category: 'lunch'
      },
      {
        id: 'food-5',
        name: 'عصير بروتين',
        calories: 200,
        protein: 25,
        carbs: 15,
        fat: 5,
        category: 'snack'
      },
      {
        id: 'food-6',
        name: 'بيض مسلوق',
        calories: 155,
        protein: 13,
        carbs: 1,
        fat: 11,
        category: 'breakfast'
      },
      {
        id: 'food-7',
        name: 'أفوكادو',
        calories: 240,
        protein: 3,
        carbs: 12,
        fat: 22,
        category: 'snack'
      },
      {
        id: 'food-8',
        name: 'خبز أسمر',
        calories: 80,
        protein: 4,
        carbs: 15,
        fat: 1,
        category: 'breakfast'
      },
      {
        id: 'food-9',
        name: 'زبادي يوناني',
        calories: 100,
        protein: 10,
        carbs: 4,
        fat: 5,
        category: 'snack'
      },
      {
        id: 'food-10',
        name: 'لوز نيء',
        calories: 160,
        protein: 6,
        carbs: 6,
        fat: 14,
        category: 'snack'
      },
      {
        id: 'food-11',
        name: 'موز',
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        category: 'snack'
      },
      {
        id: 'food-12',
        name: 'تفاح',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        category: 'snack'
      },
      {
        id: 'food-13',
        name: 'أرز بني',
        calories: 110,
        protein: 2.5,
        carbs: 23,
        fat: 0.9,
        category: 'lunch'
      },
      {
        id: 'food-14',
        name: 'بطاطا حلوة',
        calories: 90,
        protein: 2,
        carbs: 20,
        fat: 0.1,
        category: 'lunch'
      },
      {
        id: 'food-15',
        name: 'حمص',
        calories: 165,
        protein: 9,
        carbs: 27,
        fat: 2.5,
        category: 'lunch'
      }
    ];
    
    // Combine with dairy products
    const allNutritionData = [...mockNutritionData, ...dairyProducts];
    
    setNutritionData(allNutritionData);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search in the nutrition data
      const filteredResults = nutritionData.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.hebrewName && item.hebrewName.includes(searchQuery)) ||
        (item.category && item.category.includes(searchQuery))
      );

      // Format results
      const formattedResults = filteredResults.map(item => ({
        id: item.id,
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat
      }));

      setResults(formattedResults);

      if (formattedResults.length === 0) {
        setError('لم يتم العثور على نتائج. حاول استخدام كلمات بحث مختلفة');
      }
    } catch (err) {
      console.error('Error searching foods:', err);
      setError('حدث خطأ أثناء البحث');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }

    window.searchTimeout = setTimeout(() => {
      if (value.length >= 2) {
        handleSearch(value);
      } else {
        setResults([]);
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* حقل البحث */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="اكتب اسم الوجبة للبحث"
              className="w-full bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl py-3 px-5 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#0AE7F2]"
              dir="rtl"
            />
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              {loading ? (
                <Loader2 className="text-gray-400 animate-spin" size={20} />
              ) : (
                <Search className="text-gray-400" size={20} />
              )}
            </div>
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-400 text-center">
          يمكنك البحث عن عدة مكونات بفصلها بمسافة
        </p>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="text-red-500 text-center p-4 bg-red-500/10 rounded-xl">
          {error}
        </div>
      )}

      {/* نتائج البحث */}
      {results.length > 0 && (
        <div className="bg-[#1A1F2E]/80 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
          {results.map((food) => (
            <button
              key={food.id}
              onClick={() => onSelectFood(food)}
              className="w-full px-4 py-3 text-right hover:bg-[#0AE7F2]/10 transition-colors flex justify-between items-center border-b border-[#0AE7F2]/10 last:border-0"
            >
              <div className="flex flex-col items-end gap-1">
                <span className="font-medium" dir="rtl">{food.name}</span>
                <div className="text-sm text-gray-400 flex gap-3">
                  <span>بروتين: {food.protein}g</span>
                  <span>كربوهيدرات: {food.carbs}g</span>
                  <span>دهون: {food.fat}g</span>
                </div>
              </div>
              <span className="text-[#0AE7F2] font-medium whitespace-nowrap">
                {food.calories} سعرة
              </span>
            </button>
          ))}
        </div>
      )}

      {/* رسالة عدم وجود نتائج */}
      {query && results.length === 0 && !loading && !error && (
        <div className="text-center p-4 bg-[#1A1F2E]/60 rounded-xl">
          <p>😕 لا توجد نتائج مطابقة</p>
          <p className="text-sm text-gray-400 mt-2">
            جرب:
            <br />
            - البحث عن كل مكون على حدة
            <br />
            - استخدام كلمات بحث مختلفة
          </p>
        </div>
      )}
    </div>
  );
}