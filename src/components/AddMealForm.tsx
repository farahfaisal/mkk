import React, { useState, useEffect } from 'react';
import { X, Plus, MessageCircle, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { NutritionSearch } from './NutritionSearch';
import { FoodSearch } from './FoodSearch';
import { dairyProducts } from '../lib/data/dairyProducts';

interface AddMealFormProps {
  onClose: () => void;
  onSubmit: (meal: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    description?: string;
    category: string;
  }) => void;
  initialData?: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    description?: string;
    category: string;
  };
}

export function AddMealForm({ onClose, onSubmit, initialData }: AddMealFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    description: '',
    category: 'breakfast'
  });
  const [showDairyList, setShowDairyList] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    milk: true,
    yogurt: false,
    cheese: false,
    cream: false,
    butter: false,
    icecream: false,
    substitute: false,
    other: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        calories: initialData.calories || 0,
        protein: initialData.protein || 0,
        carbs: initialData.carbs || 0,
        fat: initialData.fat || 0,
        description: initialData.description || '',
        category: initialData.category || 'breakfast'
      });
    }
  }, [initialData]);

  const handleFoodSelect = (food: any) => {
    setFormData({
      ...formData,
      name: food.name || formData.name,
      calories: parseInt(food.calories || '0'),
      protein: parseFloat(food.protein || '0'),
      carbs: parseFloat(food.carbs || '0'),
      fat: parseFloat(food.fat || '0')
    });
  };

  const handleDairySelect = (product: any) => {
    setFormData({
      ...formData,
      name: product.name || formData.name,
      calories: parseInt(product.calories || 0),
      protein: parseFloat(product.protein || 0),
      carbs: parseFloat(product.carbs || 0),
      fat: parseFloat(product.fat || 0)
    });
    setShowDairyList(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'milk': return 'الحليب';
      case 'yogurt': return 'الزبادي';
      case 'cheese': return 'الجبن';
      case 'cream': return 'القشدة';
      case 'butter': return 'الزبدة';
      case 'icecream': return 'الآيس كريم';
      case 'substitute': return 'بدائل الحليب';
      case 'other': return 'منتجات أخرى';
      default: return category;
    }
  };

  const filteredDairyProducts = dairyProducts.filter(product => {
    if (!searchQuery) return true;
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.hebrewName && product.hebrewName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Group products by category
  const groupedProducts: Record<string, typeof dairyProducts> = {};
  filteredDairyProducts.forEach(product => {
    if (!groupedProducts[product.category]) {
      groupedProducts[product.category] = [];
    }
    groupedProducts[product.category].push(product);
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#0AE7F2]/20 flex items-center justify-between">
          <h2 className="text-xl font-bold">{initialData ? 'تعديل وجبة' : 'إضافة وجبة جديدة'}</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#0AE7F2]/10 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!initialData && (
            <>
              {/* Search Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg mb-0">البحث في قاعدة البيانات</h3>
                  <button
                    onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                    className="text-[#0AE7F2] text-sm hover:underline"
                  >
                    {showAdvancedSearch ? 'بحث بسيط' : 'بحث متقدم'}
                  </button>
                </div>
                
                {showAdvancedSearch ? (
                  <FoodSearch onSelectFood={handleFoodSelect} />
                ) : (
                  <NutritionSearch onSelectFood={handleFoodSelect} />
                )}
              </div>

              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#0AE7F2]/20"></div>
                </div>
                <div className="relative bg-[#1A1F2E] px-4">
                  <span className="text-sm text-gray-400">أو</span>
                </div>
              </div>

              {/* Dairy Products List */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowDairyList(!showDairyList)}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white flex justify-between items-center"
                >
                  <span>اختر من قائمة منتجات الألبان</span>
                  {showDairyList ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showDairyList && (
                  <div className="mt-3 bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-4">
                    {/* Search within dairy products */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث في منتجات الألبان..."
                        className="w-full bg-[#1A1F2E] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#0AE7F2]"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                      {Object.keys(groupedProducts).length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          لا توجد نتائج مطابقة للبحث
                        </div>
                      ) : (
                        Object.entries(groupedProducts).map(([category, products]) => (
                          <div key={category} className="mb-3">
                            <button
                              type="button"
                              onClick={() => toggleCategory(category)}
                              className="w-full flex justify-between items-center p-2 bg-[#1A1F2E] rounded-lg mb-2"
                            >
                              <span className="font-medium">{getCategoryName(category)}</span>
                              {expandedCategories[category] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            
                            {expandedCategories[category] && (
                              <div className="space-y-2 pr-2">
                                {products.map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDairySelect(product);
                                    }}
                                    className="w-full text-right p-2 hover:bg-[#1A1F2E] rounded-lg flex justify-between items-center"
                                  >
                                    <div className="text-[#0AE7F2]">{product.calories} سعرة</div>
                                    <div className="text-right">
                                      <div>{product.name}</div>
                                      {product.hebrewName && (
                                        <div className="text-xs text-gray-400">{product.hebrewName}</div>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">اسم الوجبة</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0AE7F2]"
                placeholder="أدخل اسم الوجبة"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">التصنيف</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                required
              >
                <option value="breakfast">الفطور</option>
                <option value="lunch">الغداء</option>
                <option value="dinner">العشاء</option>
                <option value="snack">وجبة خفيفة</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">السعرات الحرارية</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">البروتين (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">الكربوهيدرات (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">الدهون (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) })}
                  className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">وصف الوجبة (اختياري)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0AE7F2] h-24 resize-none"
                placeholder="أدخل وصفاً للوجبة..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>{initialData ? 'تحديث الوجبة' : 'إضافة الوجبة'}</span>
              </button>
            </div>
          </form>

          {/* Support Box */}
          <div className="mt-6 bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle size={20} className="text-[#0AE7F2]" />
              <h3 className="font-medium">تواصل معنا</h3>
            </div>
            <p className="text-sm text-gray-400">
              إذا كان لديك استفسار أو تحتاج إلى مساعدة، يمكنك التواصل معنا عبر:
            </p>
            <div className="mt-2 text-sm">
              <a href="#" className="text-[#0AE7F2] hover:underline">support@example.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}