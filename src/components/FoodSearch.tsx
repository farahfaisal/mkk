import React, { useState, useEffect } from 'react';
import { Search, Loader2, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { dairyProducts } from '../lib/data/dairyProducts';

interface FoodSearchProps {
  onSelectFood: (food: any) => void;
}

export function FoodSearch({ onSelectFood }: FoodSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [caloriesRange, setCaloriesRange] = useState<[number, number]>([0, 1000]);
  const [proteinRange, setProteinRange] = useState<[number, number]>([0, 100]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load all products
    setAllProducts(dairyProducts);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCategory, caloriesRange, proteinRange]);

  const handleSearch = () => {
    setLoading(true);
    
    // Filter products based on search criteria
    const filtered = allProducts.filter(product => {
      // Text search
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.hebrewName && product.hebrewName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Category filter
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      // Calories range
      const matchesCalories = product.calories >= caloriesRange[0] && product.calories <= caloriesRange[1];
      
      // Protein range
      const matchesProtein = product.protein >= proteinRange[0] && product.protein <= proteinRange[1];
      
      return matchesSearch && matchesCategory && matchesCalories && matchesProtein;
    });
    
    setSearchResults(filtered);
    setLoading(false);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setCaloriesRange([0, 1000]);
    setProteinRange([0, 100]);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
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

  // Group products by category
  const groupedProducts: Record<string, typeof dairyProducts> = {};
  searchResults.forEach(product => {
    if (!groupedProducts[product.category]) {
      groupedProducts[product.category] = [];
    }
    groupedProducts[product.category].push(product);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl py-2 px-4 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#0AE7F2]"
          />
          <Search className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" size={20} />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl p-2 text-[#0AE7F2] hover:bg-[#1A1F2E] transition-colors"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">تصفية النتائج</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-[#0AE7F2] hover:underline"
            >
              مسح الفلاتر
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">التصنيف</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
            >
              <option value="">جميع التصنيفات</option>
              <option value="milk">الحليب</option>
              <option value="yogurt">الزبادي</option>
              <option value="cheese">الجبن</option>
              <option value="cream">القشدة</option>
              <option value="butter">الزبدة</option>
              <option value="icecream">الآيس كريم</option>
              <option value="substitute">بدائل الحليب</option>
              <option value="other">منتجات أخرى</option>
            </select>
          </div>

          {/* Calories Range */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              السعرات الحرارية: {caloriesRange[0]} - {caloriesRange[1]}
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={caloriesRange[0]}
                onChange={(e) => setCaloriesRange([parseInt(e.target.value), caloriesRange[1]])}
                className="w-1/2"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={caloriesRange[1]}
                onChange={(e) => setCaloriesRange([caloriesRange[0], parseInt(e.target.value)])}
                className="w-1/2"
              />
            </div>
          </div>

          {/* Protein Range */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              البروتين (جرام): {proteinRange[0]} - {proteinRange[1]}
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={proteinRange[0]}
                onChange={(e) => setProteinRange([parseInt(e.target.value), proteinRange[1]])}
                className="w-1/2"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={proteinRange[1]}
                onChange={(e) => setProteinRange([proteinRange[0], parseInt(e.target.value)])}
                className="w-1/2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 size={24} className="text-[#0AE7F2] animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          <div className="text-sm text-gray-400 mb-2">
            تم العثور على {searchResults.length} منتج
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl p-6 text-center">
              <p className="text-gray-400">لم يتم العثور على منتجات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedProducts).map(([category, products]) => (
                <div key={category} className="bg-[#1A1F2E]/60 border border-[#0AE7F2]/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#1A1F2E] transition-colors"
                  >
                    <h3 className="font-medium">{getCategoryName(category)}</h3>
                    {expandedCategories[category] ? (
                      <ChevronUp size={20} className="text-[#0AE7F2]" />
                    ) : (
                      <ChevronDown size={20} className="text-[#0AE7F2]" />
                    )}
                  </button>
                  
                  {expandedCategories[category] && (
                    <div className="border-t border-[#0AE7F2]/20">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => onSelectFood(product)}
                          className="w-full px-4 py-3 text-right hover:bg-[#0AE7F2]/10 transition-colors flex justify-between items-center border-b border-[#0AE7F2]/10 last:border-0"
                        >
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-medium" dir="rtl">{product.name}</span>
                            {product.hebrewName && (
                              <span className="text-xs text-gray-400">{product.hebrewName}</span>
                            )}
                            <div className="text-xs text-gray-400 flex gap-3">
                              <span>بروتين: {product.protein}g</span>
                              <span>كربوهيدرات: {product.carbs}g</span>
                              <span>دهون: {product.fat}g</span>
                            </div>
                          </div>
                          <span className="text-[#0AE7F2] font-medium whitespace-nowrap">
                            {product.calories} سعرة
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}