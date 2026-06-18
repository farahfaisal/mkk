import { supabase, isSupabaseConnected } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

export interface WeeklyPerformance {
  day: string;
  date: string;
  completedExercises: number;
  completedMeals: number;
  value: number;
}

// أسماء الأيام بالعربية
const ARABIC_DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// دالة لجلب بيانات الأداء الأسبوعي
export const getWeeklyPerformance = async (): Promise<WeeklyPerformance[]> => {
  // الحصول على تواريخ الأسبوع الحالي (7 أيام للخلف)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const emptyWeek = (): WeeklyPerformance[] =>
    dates.map(date => ({
      day: ARABIC_DAY_NAMES[new Date(date).getDay()],
      date,
      completedExercises: 0,
      completedMeals: 0,
      value: 0
    }));

  if (!isSupabaseConnected()) {
    return emptyWeek();
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return emptyWeek();
    }

    const { data, error } = await supabase
      .from('trainee_performance')
      .select('date, completed_exercises, completed_meals, progress_value')
      .eq('trainee_id', user.id)
      .in('date', dates);

    if (error) {
      console.error('Error fetching performance data:', error);
      return emptyWeek();
    }

    const performanceMap = new Map<string, WeeklyPerformance>();

    data?.forEach(item => {
      const date = new Date(item.date);
      performanceMap.set(item.date, {
        day: ARABIC_DAY_NAMES[date.getDay()],
        date: item.date,
        completedExercises: item.completed_exercises,
        completedMeals: item.completed_meals,
        value: item.progress_value
      });
    });

    return dates.map(date => {
      if (performanceMap.has(date)) {
        return performanceMap.get(date)!;
      }
      return {
        day: ARABIC_DAY_NAMES[new Date(date).getDay()],
        date,
        completedExercises: 0,
        completedMeals: 0,
        value: 0
      };
    });
  } catch (error) {
    console.error('Error fetching weekly performance:', error);
    return emptyWeek();
  }
};

// دالة لتحديث بيانات الأداء اليومي
export const updateDailyPerformance = async (
  completedExercises: number,
  completedMeals: number
): Promise<WeeklyPerformance | null> => {
  if (!isSupabaseConnected()) {
    // محاكاة التحديث في بيئة التطوير
    const today = new Date();
    const dayName = ARABIC_DAY_NAMES[today.getDay()];
    const date = today.toISOString().split('T')[0];
    
    // حساب قيمة التقدم (60% تمارين، 40% وجبات)
    const exerciseWeight = 0.6;
    const mealWeight = 0.4;
    const maxExercises = 5; // افتراضي
    const maxMeals = 3; // افتراضي
    
    const exerciseProgress = Math.min(1, completedExercises / maxExercises) * 100 * exerciseWeight;
    const mealProgress = Math.min(1, completedMeals / maxMeals) * 100 * mealWeight;
    const value = Math.round(exerciseProgress + mealProgress);
    
    return {
      day: dayName,
      date,
      completedExercises,
      completedMeals,
      value
    };
  }

  try {
    // الحصول على المستخدم الحالي
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const today = new Date();
    const date = today.toISOString().split('T')[0];
    
    // حساب قيمة التقدم (60% تمارين، 40% وجبات)
    const exerciseWeight = 0.6;
    const mealWeight = 0.4;
    const maxExercises = 5; // افتراضي
    const maxMeals = 3; // افتراضي
    
    const exerciseProgress = Math.min(1, completedExercises / maxExercises) * 100 * exerciseWeight;
    const mealProgress = Math.min(1, completedMeals / maxMeals) * 100 * mealWeight;
    const value = Math.round(exerciseProgress + mealProgress);

    // التحقق من وجود سجل لليوم الحالي
    const { data: existingRecord, error: fetchError } = await supabase
      .from('trainee_performance')
      .select('id')
      .eq('trainee_id', user.id)
      .eq('date', date)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;
    
    if (existingRecord) {
      // تحديث السجل الموجود
      const { data, error } = await supabase
        .from('trainee_performance')
        .update({
          completed_exercises: completedExercises,
          completed_meals: completedMeals,
          progress_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // إنشاء سجل جديد
      const { data, error } = await supabase
        .from('trainee_performance')
        .insert({
          id: uuidv4(),
          trainee_id: user.id,
          date,
          completed_exercises: completedExercises,
          completed_meals: completedMeals,
          progress_value: value
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // تحويل البيانات إلى التنسيق المطلوب
    const dayName = ARABIC_DAY_NAMES[today.getDay()];
    
    return {
      day: dayName,
      date: result.date,
      completedExercises: result.completed_exercises,
      completedMeals: result.completed_meals,
      value: result.progress_value
    };
  } catch (error) {
    console.error('Error updating daily performance:', error);
    return null;
  }
};

// دالة لإنشاء بيانات أداء وهمية للأسبوع الحالي
export const generateMockWeeklyPerformance = async (): Promise<boolean> => {
  if (!isSupabaseConnected()) {
    return false;
  }

  try {
    // الحصول على المستخدم الحالي
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return false;
    }

    // إنشاء بيانات للأسبوع الحالي
    const today = new Date();
    const records = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // إنشاء بيانات عشوائية
      const completedExercises = Math.floor(Math.random() * 5) + 1; // 1-5
      const completedMeals = Math.floor(Math.random() * 3) + 1; // 1-3
      
      // حساب قيمة التقدم
      const exerciseWeight = 0.6;
      const mealWeight = 0.4;
      const maxExercises = 5;
      const maxMeals = 3;
      
      const exerciseProgress = Math.min(1, completedExercises / maxExercises) * 100 * exerciseWeight;
      const mealProgress = Math.min(1, completedMeals / maxMeals) * 100 * mealWeight;
      const value = Math.round(exerciseProgress + mealProgress);

      records.push({
        id: uuidv4(),
        trainee_id: user.id,
        date: dateStr,
        completed_exercises: completedExercises,
        completed_meals: completedMeals,
        progress_value: value
      });
    }

    // إدخال البيانات إلى قاعدة البيانات
    const { error } = await supabase
      .from('trainee_performance')
      .upsert(records, { onConflict: 'trainee_id,date' });

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error generating mock weekly performance:', error);
    return false;
  }
};