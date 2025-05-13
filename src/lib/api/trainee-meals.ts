import { supabase, isSupabaseConnected } from '../supabase';

export interface TraineeMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  status: 'pending' | 'consumed' | 'skipped';
}

export interface TraineePerformance {
  completedExercises: number;
  totalExercises: number;
  completedMeals: number;
  totalMeals: number;
  progress: number;
}

export const getTraineeMeals = async (traineeId: string): Promise<TraineeMeal[]> => {
  if (!isSupabaseConnected()) {
    // Return mock data
    return [
      {
        id: '1',
        name: 'شوفان بالموز',
        calories: 350,
        protein: 12,
        carbs: 45,
        fat: 8,
        date: new Date().toISOString(),
        status: 'consumed'
      },
      {
        id: '2',
        name: 'صدر دجاج مشوي',
        calories: 450,
        protein: 35,
        carbs: 20,
        fat: 15,
        date: new Date().toISOString(),
        status: 'pending'
      }
    ];
  }

  const { data, error } = await supabase
    .from('trainee_meals')
    .select(`
      id,
      name,
      calories,
      protein,
      carbs,
      fat,
      created_at,
      status
    `)
    .eq('trainee_id', traineeId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(meal => ({
    id: meal.id,
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    date: meal.created_at,
    status: meal.status
  }));
};

export const getTraineePerformance = async (traineeId: string): Promise<TraineePerformance> => {
  if (!isSupabaseConnected()) {
    // Return mock data
    return {
      completedExercises: 45,
      totalExercises: 60,
      completedMeals: 38,
      totalMeals: 45,
      progress: 75
    };
  }

  const { data, error } = await supabase
    .from('trainee_profiles')
    .select('progress')
    .eq('id', traineeId)
    .single();

  if (error) throw error;

  return {
    completedExercises: data.progress.completed_exercises || 0,
    totalExercises: data.progress.total_exercises || 0,
    completedMeals: data.progress.completed_meals || 0,
    totalMeals: data.progress.total_meals || 0,
    progress: data.progress.overall_progress || 0
  };
};