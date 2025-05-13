import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Send, X, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { formatDate } from '../lib/utils/date';
import { BottomNav } from './BottomNav';
import { AddMealForm } from './AddMealForm';

interface DietProgramProps {}

interface AssignedMeal {
  id: string;
  mealId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  timing: string;
  mealName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  description?: string;
  status: 'pending' | 'consumed' | 'skipped';
}

interface CustomMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
  category: string;
}

export function DietProgram({}: DietProgramProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [assignedMeals, setAssignedMeals] = useState<Record<string, AssignedMeal[]>>({
    'الفطور': [],
    'الغداء': [],
    'العشاء': []
  });
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>([]);
  const [notes, setNotes] = useState('');
  const [showAddMealForm, setShowAddMealForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMealDetails, setShowMealDetails] = useState<string | null>(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [completedMeals, setCompletedMeals] = useState(0);
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }
        
        const dayOfWeek = selectedDate.getDay();
        const weekStartDate = getWeekStartDate(selectedDate);

        // Get or create weekly schedule
        const { data: existingSchedule, error: scheduleError } = await supabase
          .from('weekly_schedules')
          .select('id')
          .eq('trainee_id', user.id)
          .eq('week_start_date', weekStartDate)
          .maybeSingle();

        if (scheduleError) {
          throw scheduleError;
        }

        let currentScheduleId;
        if (!existingSchedule) {
          // Create new schedule if none exists
          const { data: newSchedule, error: createError } = await supabase
            .from('weekly_schedules')
            .upsert({
              trainee_id: user.id,
              week_start_date: weekStartDate
            })
            .select()
            .single();

          if (createError) throw createError;
          currentScheduleId = newSchedule.id;
        } else {
          currentScheduleId = existingSchedule.id;
        }

        setScheduleId(currentScheduleId);

        // Get meals for the selected day
        const { data: mealData, error: mealsError } = await supabase
          .from('schedule_meals')
          .select(`
            id,
            meal_id,
            day_of_week,
            timing,
            status,
            consumed_at,
            meals (
              name,
              calories,
              protein,
              carbs,
              fat,
              description,
              category
            )
          `)
          .eq('schedule_id', currentScheduleId)
          .eq('day_of_week', dayOfWeek);

        if (mealsError) throw mealsError;

        // Format meals by timing
        const breakfast: AssignedMeal[] = [];
        const lunch: AssignedMeal[] = [];
        const dinner: AssignedMeal[] = [];

        mealData?.forEach(meal => {
          const formattedMeal: AssignedMeal = {
            id: meal.id,
            mealId: meal.meal_id,
            dayOfWeek: meal.day_of_week,
            timing: meal.timing,
            mealName: meal.meals?.name,
            calories: meal.meals?.calories,
            protein: meal.meals?.protein,
            carbs: meal.meals?.carbs,
            fat: meal.meals?.fat,
            description: meal.meals?.description,
            status: meal.status || 'pending'
          };

          if (meal.timing === 'breakfast') {
            breakfast.push(formattedMeal);
          } else if (meal.timing === 'lunch') {
            lunch.push(formattedMeal);
          } else if (meal.timing === 'dinner') {
            dinner.push(formattedMeal);
          }
        });

        setAssignedMeals({
          'الفطور': breakfast,
          'الغداء': lunch,
          'العشاء': dinner
        });

        // Calculate total calories and completed meals
        calculateTotalCalories(breakfast, lunch, dinner);
      } else {
        // Mock data for development
        const breakfast: AssignedMeal[] = [
          { 
            id: '1', 
            mealId: '101',
            dayOfWeek: selectedDate.getDay(),
            timing: 'breakfast',
            mealName: 'شوفان بالموز', 
            calories: 350, 
            protein: 12, 
            carbs: 45, 
            fat: 8,
            description: 'شوفان مطبوخ مع حليب لوز، موز طازج، ولوز مقطع. غني بالألياف والبروتين.',
            status: 'pending'
          },
          { 
            id: '2', 
            mealId: '102',
            dayOfWeek: selectedDate.getDay(),
            timing: 'breakfast',
            mealName: 'بيض مسلوق مع خبز', 
            calories: 280, 
            protein: 15, 
            carbs: 30, 
            fat: 10,
            description: 'بيضتان مسلوقتان مع خبز أسمر وأفوكادو. غني بالبروتين والدهون الصحية.',
            status: 'pending'
          }
        ];
        
        const lunch: AssignedMeal[] = [
          { 
            id: '3', 
            mealId: '103',
            dayOfWeek: selectedDate.getDay(),
            timing: 'lunch',
            mealName: 'صدر دجاج مشوي', 
            calories: 450, 
            protein: 35, 
            carbs: 20, 
            fat: 15,
            description: 'صدر دجاج مشوي مع خضروات مشوية وأرز بني. غني بالبروتين.',
            status: 'pending'
          }
        ];
        
        const dinner: AssignedMeal[] = [
          { 
            id: '4', 
            mealId: '104',
            dayOfWeek: selectedDate.getDay(),
            timing: 'dinner',
            mealName: 'سمك سلمون مشوي', 
            calories: 400, 
            protein: 30, 
            carbs: 15, 
            fat: 20,
            description: 'سمك سلمون مشوي مع خضروات مشوية. غني بأوميغا 3 والبروتين.',
            status: 'pending'
          }
        ];
        
        setAssignedMeals({
          'الفطور': breakfast,
          'الغداء': lunch,
          'العشاء': dinner
        });

        // Calculate total calories and completed meals
        calculateTotalCalories(breakfast, lunch, dinner);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('حدث خطأ أثناء تحميل الوجبات');
    } finally {
      setLoading(false);
    }
  };

  const getWeekStartDate = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    d.setDate(d.getDate() - day); // Go to the start of the week (Sunday)
    return d.toISOString().split('T')[0];
  };

  const calculateTotalCalories = (breakfast: AssignedMeal[], lunch: AssignedMeal[], dinner: AssignedMeal[]) => {
    // Calculate total calories from completed meals
    const allMeals = [...breakfast, ...lunch, ...dinner];
    const completed = allMeals.filter(meal => meal.status === 'consumed');
    
    const totalCals = completed.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const customCals = customMeals.reduce((sum, meal) => sum + meal.calories, 0);
    
    setTotalCalories(totalCals + customCals);
    setCompletedMeals(completed.length);
  };

  const handleMealStatus = async (mealId: string, status: 'pending' | 'consumed' | 'skipped') => {
    try {
      // Find the meal in our state
      let foundMeal: AssignedMeal | undefined;
      let mealCategory: string | undefined;
      
      for (const [category, meals] of Object.entries(assignedMeals)) {
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
          foundMeal = meal;
          mealCategory = category;
          break;
        }
      }
      
      if (!foundMeal || !mealCategory) return;
      
      // Update in database if connected
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from('schedule_meals')
          .update({
            status,
            consumed_at: status === 'consumed' ? new Date().toISOString() : null
          })
          .eq('id', mealId);
          
        if (error) throw error;
      }
      
      // Update local state
      setAssignedMeals(prev => {
        const updatedMeals = { ...prev };
        updatedMeals[mealCategory!] = updatedMeals[mealCategory!].map(meal => 
          meal.id === mealId ? { ...meal, status } : meal
        );
        return updatedMeals;
      });
      
      // Recalculate calories
      const allMeals = [
        ...assignedMeals['الفطور'], 
        ...assignedMeals['الغداء'], 
        ...assignedMeals['العشاء']
      ].map(meal => 
        meal.id === mealId ? { ...meal, status } : meal
      );
      
      const completed = allMeals.filter(meal => meal.status === 'consumed');
      const totalCals = completed.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      const customCals = customMeals.reduce((sum, meal) => sum + meal.calories, 0);
      
      setTotalCalories(totalCals + customCals);
      setCompletedMeals(completed.length);
      
      // Update performance in database
      if (isSupabaseConnected()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get completed exercises count
          const { data } = await supabase
            .from('trainee_performance')
            .select('completed_exercises')
            .eq('trainee_id', user.id)
            .eq('date', new Date().toISOString().split('T')[0])
            .single();
            
          const completedExercises = data?.completed_exercises || 0;
          
          // Update performance record
          await supabase.rpc('calculate_trainee_performance', {
            p_trainee_id: user.id,
            p_date: new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (error) {
      console.error('Error updating meal status:', error);
      setError('حدث خطأ أثناء تحديث حالة الوجبة');
    }
  };

  const handleAddMeal = async (meal: CustomMeal) => {
    try {
      if (isSupabaseConnected() && scheduleId) {
        // First add the meal to the meals table
        const { data: newMeal, error: mealError } = await supabase
          .from('meals')
          .insert({
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            description: meal.description,
            category: meal.category,
            status: 'active'
          })
          .select()
          .single();
          
        if (mealError) throw mealError;
        
        // Then add it to the schedule
        const { data: scheduleMeal, error: scheduleError } = await supabase
          .from('schedule_meals')
          .insert({
            schedule_id: scheduleId,
            meal_id: newMeal.id,
            day_of_week: selectedDate.getDay(),
            timing: meal.category,
            status: 'consumed' // Mark as consumed since it's a custom meal
          })
          .select()
          .single();
          
        if (scheduleError) throw scheduleError;
        
        // Refresh meals
        fetchMeals();
      } else {
        // For development without database connection
        setCustomMeals(prev => [...prev, meal]);
        
        // Update total calories
        setTotalCalories(prev => prev + meal.calories);
        setCompletedMeals(prev => prev + 1);
      }
      
      setShowAddMealForm(false);
    } catch (error) {
      console.error('Error adding custom meal:', error);
      setError('حدث خطأ أثناء إضافة الوجبة');
    }
  };

  const handleRemoveCustomMeal = (index: number) => {
    // Get the meal being removed to subtract its calories
    const removedMeal = customMeals[index];
    
    // Remove the meal from the array
    setCustomMeals(prev => prev.filter((_, i) => i !== index));
    
    // Update total calories
    setTotalCalories(prev => prev - removedMeal.calories);
    setCompletedMeals(prev => prev - 1);
  };

  const handleSendToTrainer = async () => {
    try {
      if (isSupabaseConnected()) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }
        
        // Add note to database
        const { error } = await supabase
          .from('trainee_notes')
          .insert({
            trainee_id: user.id,
            note: notes,
            date: selectedDate.toISOString().split('T')[0],
            type: 'diet'
          });
          
        if (error) throw error;
        
        // Send notification to trainer
        await supabase
          .from('notifications')
          .insert({
            title: 'ملاحظات غذائية جديدة',
            message: `أضاف المتدرب ملاحظات جديدة حول النظام الغذائي`,
            type: 'meal',
            sender_id: user.id,
            recipient_id: null // Will be sent to all trainers
          });
      }
      
      alert('تم إرسال الملاحظات للمدرب بنجاح!');
      setNotes('');
    } catch (error) {
      console.error('Error sending notes to trainer:', error);
      alert('حدث خطأ أثناء إرسال الملاحظات');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const getDayName = (date: Date) => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'consumed':
        return <Check size={20} className="text-emerald-500" />;
      case 'skipped':
        return <X size={20} className="text-rose-500" />;
      default:
        return <Clock size={20} className="text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consumed':
        return 'bg-emerald-500/10 text-emerald-500';
      case 'skipped':
        return 'bg-rose-500/10 text-rose-500';
      default:
        return 'bg-amber-500/10 text-amber-500';
    }
  };

  const getTimingTranslation = (timing: string): string => {
    switch (timing) {
      case 'breakfast': return 'الفطور';
      case 'lunch': return 'الغداء';
      case 'dinner': return 'العشاء';
      case 'snack': return 'وجبة خفيفة';
      default: return timing;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white">
      {/* Background */}
      <div className="bg-base">
        <div className="bg-overlay">
          <div className="bg-pattern" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="header-base">
          <div className="flex justify-between items-center">
            <button onClick={handleBack} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">برنامجك الغذائي</h1>
            <div className="w-6"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto content-container">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center mb-6">
              {error}
              <button 
                onClick={fetchMeals}
                className="underline hover:no-underline mt-2 block w-full"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Total Calories */}
              <div className="card-base">
                <h2 className="text-lg font-bold mb-4">إجمالي السعرات المستهلكة</h2>
                <div className="text-center">
                  <span className="text-4xl font-bold text-[#0AE7F2]">{totalCalories}</span>
                  <span className="text-gray-400 mr-2">سعرة حرارية</span>
                </div>
              </div>

              {/* Date Navigation */}
              <div className="flex justify-between items-center">
                <button onClick={handlePrevDay} className="text-[#0AE7F2]">
                  <ChevronRight size={24} />
                </button>
                <div className="text-center">
                  <span className="text-lg">{formatDate(selectedDate, 'yyyy-MM-dd')}</span>
                  <p className="text-sm text-[#0AE7F2]">{getDayName(selectedDate)}</p>
                </div>
                <button onClick={handleNextDay} className="text-[#0AE7F2]">
                  <ChevronLeft size={24} />
                </button>
              </div>

              {/* Meals */}
              {['الفطور', 'الغداء', 'العشاء'].map((mealType) => (
                <div key={mealType} className="card-base">
                  <h2 className="text-lg font-bold mb-4">{mealType}</h2>
                  {assignedMeals[mealType]?.length > 0 ? (
                    <div className="space-y-4">
                      {assignedMeals[mealType].map(meal => (
                        <div key={meal.id} className="bg-[#1A1F2E]/40 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMealStatus(meal.id, 'consumed')}
                                className={`p-2 rounded-full ${meal.status === 'consumed' ? 'bg-emerald-500/10' : 'hover:bg-emerald-500/10'}`}
                              >
                                <Check size={16} className={meal.status === 'consumed' ? 'text-emerald-500' : 'text-gray-400'} />
                              </button>
                              <button
                                onClick={() => handleMealStatus(meal.id, 'skipped')}
                                className={`p-2 rounded-full ${meal.status === 'skipped' ? 'bg-rose-500/10' : 'hover:bg-rose-500/10'}`}
                              >
                                <X size={16} className={meal.status === 'skipped' ? 'text-rose-500' : 'text-gray-400'} />
                              </button>
                            </div>
                            <div className="text-right">
                              <h3 className="font-medium">{meal.mealName}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(meal.status)}`}>
                                  {meal.status === 'consumed' ? 'تم تناولها' : 
                                   meal.status === 'skipped' ? 'تم تخطيها' : 'معلقة'}
                                </span>
                                <span className="text-[#0AE7F2]">{meal.calories} سعرة</span>
                              </div>
                            </div>
                          </div>
                          
                          {showMealDetails === meal.id && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-400 mb-3">{meal.description}</p>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-[#0A0F1C]/40 rounded-lg p-2 text-center">
                                  <span className="text-sm font-medium text-[#0AE7F2]">{meal.protein}g</span>
                                  <p className="text-xs text-gray-400">بروتين</p>
                                </div>
                                <div className="bg-[#0A0F1C]/40 rounded-lg p-2 text-center">
                                  <span className="text-sm font-medium text-[#0AE7F2]">{meal.carbs}g</span>
                                  <p className="text-xs text-gray-400">كربوهيدرات</p>
                                </div>
                                <div className="bg-[#0A0F1C]/40 rounded-lg p-2 text-center">
                                  <span className="text-sm font-medium text-[#0AE7F2]">{meal.fat}g</span>
                                  <p className="text-xs text-gray-400">دهون</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => setShowMealDetails(showMealDetails === meal.id ? null : meal.id)}
                            className="w-full text-center text-[#0AE7F2] text-sm mt-2"
                          >
                            {showMealDetails === meal.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      لا توجد وجبات {mealType} لهذا اليوم
                    </div>
                  )}
                </div>
              ))}

              {/* Custom Meals */}
              {customMeals.length > 0 && (
                <div className="card-base">
                  <h2 className="text-lg font-bold mb-4">وجباتك المخصصة</h2>
                  <div className="space-y-4">
                    {customMeals.map((meal, index) => (
                      <div key={index} className="bg-[#1A1F2E]/40 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <button
                            onClick={() => handleRemoveCustomMeal(index)}
                            className="text-rose-500 hover:text-rose-400 p-1 rounded-full hover:bg-rose-500/10"
                          >
                            <X size={16} />
                          </button>
                          <div className="text-right">
                            <h3 className="font-medium">{meal.name}</h3>
                            <span className="text-[#0AE7F2]">{meal.calories} سعرة</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>بروتين: {meal.protein}g</span>
                          <span>كربوهيدرات: {meal.carbs}g</span>
                          <span>دهون: {meal.fat}g</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Meal Button */}
              <button
                onClick={() => setShowAddMealForm(true)}
                className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-bold hover:bg-[#0AE7F2]/90"
              >
                <Plus size={20} className="inline mr-2" /> إضافة وجبة جديدة
              </button>

              {/* Notes */}
              <div className="mt-6">
                <h2 className="text-lg font-bold mb-2">ملاحظات للمدرب</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أكتب ملاحظتك هنا..."
                  className="w-full bg-[#1A1F2E]/40 rounded-xl p-3 text-white resize-none h-32"
                />
              </div>

              {/* Send Notes Button */}
              <button
                onClick={handleSendToTrainer}
                className="w-full bg-[#0AE7F2] text-black py-3 rounded-xl font-bold hover:bg-[#0AE7F2]/90 mt-4"
              >
                <Send size={20} className="inline mr-2" /> إرسال للمدرب
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Add Meal Form */}
        {showAddMealForm && (
          <AddMealForm
            onClose={() => setShowAddMealForm(false)}
            onSubmit={handleAddMeal}
          />
        )}
      </div>
    </div>
  );
}