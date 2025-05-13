import { supabase, isSupabaseConnected } from '../supabase';

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
  timing?: string;
  category: string;
  status?: string;
}

export interface TraineeMeal {
  id: string;
  traineeId: string;
  mealId: string;
  status: 'pending' | 'consumed' | 'skipped';
  consumedAt?: Date;
  notes?: string;
}

// Get all meals
export const getMeals = async (): Promise<Meal[]> => {
  if (!isSupabaseConnected()) {
    // Return mock data
    return [
      {
        id: '123e4567-e89b-12d3-a456-426614174020',
        name: 'شوفان بالموز',
        calories: 350,
        protein: 12,
        carbs: 45,
        fat: 8,
        description: 'وجبة فطور صحية غنية بالألياف',
        category: 'breakfast',
        status: 'active'
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174021',
        name: 'صدر دجاج مشوي',
        calories: 450,
        protein: 35,
        carbs: 20,
        fat: 15,
        description: 'وجبة غداء غنية بالبروتين',
        category: 'lunch',
        status: 'active'
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174022',
        name: 'سلمون مشوي',
        calories: 400,
        protein: 30,
        carbs: 15,
        fat: 20,
        description: 'وجبة عشاء صحية غنية بالأوميغا 3',
        category: 'dinner',
        status: 'active'
      }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
};

// Add a new meal
export const addMeal = async (meal: Omit<Meal, 'id'>): Promise<Meal> => {
  if (!isSupabaseConnected()) {
    // Mock add for development
    return {
      id: Date.now().toString(),
      ...meal,
      status: 'active'
    };
  }

  try {
    const { data, error } = await supabase
      .from('meals')
      .insert([{
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        description: meal.description,
        category: meal.category,
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
};

// Update a meal
export const updateMeal = async (id: string, meal: Partial<Meal>): Promise<Meal> => {
  if (!isSupabaseConnected()) {
    // Mock update for development
    return {
      id,
      name: meal.name || '',
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      description: meal.description,
      category: meal.category || 'breakfast',
      status: 'active'
    };
  }

  try {
    const { data, error } = await supabase
      .from('meals')
      .update({
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        description: meal.description,
        category: meal.category
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

// Delete a meal
export const deleteMeal = async (id: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    // Mock delete for development
    return;
  }

  try {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

// Get trainee meals
export const getTraineeMeals = async (traineeId: string): Promise<TraineeMeal[]> => {
  if (!isSupabaseConnected()) {
    return [];
  }

  const { data, error } = await supabase
    .from('trainee_meals')
    .select(`
      id,
      meal_id,
      status,
      consumed_at,
      notes
    `)
    .eq('trainee_id', traineeId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(meal => ({
    id: meal.id,
    traineeId,
    mealId: meal.meal_id,
    status: meal.status,
    consumedAt: meal.consumed_at ? new Date(meal.consumed_at) : undefined,
    notes: meal.notes
  }));
};

// Assign meal to trainee
export const assignMealToTrainee = async (
  traineeId: string,
  mealId: string,
  notes?: string
): Promise<TraineeMeal> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('trainee_meals')
    .insert({
      trainee_id: traineeId,
      meal_id: mealId,
      status: 'pending',
      notes
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    traineeId,
    mealId: data.meal_id,
    status: data.status,
    consumedAt: data.consumed_at ? new Date(data.consumed_at) : undefined,
    notes: data.notes
  };
};

// Update meal status
export const updateMealStatus = async (
  traineeId: string,
  mealId: string,
  status: 'consumed' | 'skipped'
): Promise<void> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  const { error } = await supabase
    .from('trainee_meals')
    .update({
      status,
      consumed_at: status === 'consumed' ? new Date().toISOString() : null
    })
    .eq('trainee_id', traineeId)
    .eq('meal_id', mealId);

  if (error) throw error;
};

// Get meal alternatives
export const getMealAlternatives = async (mealId: string): Promise<Meal[]> => {
  if (!isSupabaseConnected()) {
    return [];
  }

  const { data, error } = await supabase
    .from('meal_alternatives')
    .select('*')
    .eq('original_meal_id', mealId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};