import { supabase, isSupabaseConnected } from '../supabase';

export interface TraineePerformance {
  completedExercises: number;
  completedMeals: number;
  progress: number;
}

export interface TraineeExercise {
  id: string;
  exerciseId: string;
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: Date;
}

export interface TraineeMeal {
  id: string;
  mealId: string;
  status: 'pending' | 'consumed' | 'skipped';
  consumedAt?: Date;
}

// Get trainee performance
export const getTraineePerformance = async (traineeId: string): Promise<TraineePerformance> => {
  if (!isSupabaseConnected()) {
    // Return mock data
    return {
      completedExercises: 5,
      completedMeals: 3,
      progress: 40
    };
  }

  const { data, error } = await supabase!
    .from('trainees')
    .select('progress')
    .eq('id', traineeId)
    .single();

  if (error) throw error;

  return {
    completedExercises: data.progress.completed_exercises || 0,
    completedMeals: data.progress.completed_meals || 0,
    progress: data.progress.overall_progress || 0
  };
};

// Get trainee exercises
export const getTraineeExercises = async (traineeId: string): Promise<TraineeExercise[]> => {
  if (!isSupabaseConnected()) {
    // Return mock data
    return [
      { id: '1', exerciseId: '1', status: 'completed' },
      { id: '2', exerciseId: '2', status: 'pending' }
    ];
  }

  const { data, error } = await supabase!
    .from('trainee_exercises')
    .select('*')
    .eq('trainee_id', traineeId);

  if (error) throw error;

  return data.map(exercise => ({
    id: exercise.id,
    exerciseId: exercise.exercise_id,
    status: exercise.status,
    completedAt: exercise.completed_at ? new Date(exercise.completed_at) : undefined
  }));
};

// Get trainee meals
export const getTraineeMeals = async (traineeId: string): Promise<TraineeMeal[]> => {
  if (!isSupabaseConnected()) {
    // Return mock data
    return [
      { id: '1', mealId: '1', status: 'consumed' },
      { id: '2', mealId: '2', status: 'pending' }
    ];
  }

  const { data, error } = await supabase!
    .from('trainee_meals')
    .select('*')
    .eq('trainee_id', traineeId);

  if (error) throw error;

  return data.map(meal => ({
    id: meal.id,
    mealId: meal.meal_id,
    status: meal.status,
    consumedAt: meal.consumed_at ? new Date(meal.consumed_at) : undefined
  }));
};

// Update exercise status
export const updateExerciseStatus = async (
  traineeId: string,
  exerciseId: string,
  status: 'completed' | 'skipped'
): Promise<void> => {
  if (!isSupabaseConnected()) {
    // Mock update
    console.log('Exercise status updated:', { traineeId, exerciseId, status });
    return;
  }

  const { error } = await supabase!
    .from('trainee_exercises')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    })
    .eq('trainee_id', traineeId)
    .eq('exercise_id', exerciseId);

  if (error) throw error;
};

// Update meal status
export const updateMealStatus = async (
  traineeId: string,
  mealId: string,
  status: 'consumed' | 'skipped'
): Promise<void> => {
  if (!isSupabaseConnected()) {
    // Mock update
    console.log('Meal status updated:', { traineeId, mealId, status });
    return;
  }

  const { error } = await supabase!
    .from('trainee_meals')
    .update({
      status,
      consumed_at: status === 'consumed' ? new Date().toISOString() : null
    })
    .eq('trainee_id', traineeId)
    .eq('meal_id', mealId);

  if (error) throw error;
};

// Assign exercise to trainee
export const assignExerciseToTrainee = async (
  traineeId: string,
  exerciseId: string
): Promise<void> => {
  if (!isSupabaseConnected()) {
    // Mock assignment
    console.log('Exercise assigned:', { traineeId, exerciseId });
    return;
  }

  const { error } = await supabase!
    .from('trainee_exercises')
    .insert({
      trainee_id: traineeId,
      exercise_id: exerciseId,
      status: 'pending'
    });

  if (error) throw error;
};

// Assign meal to trainee
export const assignMealToTrainee = async (
  traineeId: string,
  mealId: string
): Promise<void> => {
  if (!isSupabaseConnected()) {
    // Mock assignment
    console.log('Meal assigned:', { traineeId, mealId });
    return;
  }

  const { error } = await supabase!
    .from('trainee_meals')
    .insert({
      trainee_id: traineeId,
      meal_id: mealId,
      status: 'pending'
    });

  if (error) throw error;
};