import { supabase, isSupabaseConnected } from '../supabase';

export interface MealSchedule {
  id: string;
  traineeId: string;
  weekStartDate: string;
  meals: ScheduleMeal[];
}

export interface ScheduleMeal {
  id: string;
  mealId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  timing: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealName?: string;
  calories?: number;
}

// Validate UUID format
const isValidUUID = (uuid: string) => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const getMealSchedule = async (traineeId: string, weekStartDate: string): Promise<MealSchedule | null> => {
  if (!isSupabaseConnected()) {
    return {
      id: '123e4567-e89b-12d3-a456-426614174100',
      traineeId,
      weekStartDate,
      meals: [
        {
          id: '123e4567-e89b-12d3-a456-426614174101',
          mealId: '123e4567-e89b-12d3-a456-426614174020',
          dayOfWeek: 0,
          timing: 'breakfast',
          mealName: 'شوفان بالموز',
          calories: 350
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174102',
          mealId: '123e4567-e89b-12d3-a456-426614174021',
          dayOfWeek: 0,
          timing: 'lunch',
          mealName: 'صدر دجاج مشوي',
          calories: 450
        }
      ]
    };
  }

  try {
    // Validate traineeId is a valid UUID
    if (!isValidUUID(traineeId)) {
      console.warn('Invalid trainee ID format:', traineeId);
      throw new Error('Invalid trainee ID format');
    }

    // Get or create schedule for the week
    const { data: schedule, error: scheduleError } = await supabase
      .from('weekly_schedules')
      .select('id')
      .eq('trainee_id', traineeId)
      .eq('week_start_date', weekStartDate)
      .single();

    if (scheduleError && scheduleError.code !== 'PGRST116') throw scheduleError;

    let scheduleId;
    if (!schedule) {
      const { data: newSchedule, error: createError } = await supabase
        .from('weekly_schedules')
        .insert({ trainee_id: traineeId, week_start_date: weekStartDate })
        .select('id')
        .single();

      if (createError) throw createError;
      scheduleId = newSchedule.id;
    } else {
      scheduleId = schedule.id;
    }

    // Get meals for the schedule
    const { data: meals, error: mealsError } = await supabase
      .from('schedule_meals')
      .select(`
        id,
        meal_id,
        day_of_week,
        timing,
        meals (
          name,
          calories
        )
      `)
      .eq('schedule_id', scheduleId);

    if (mealsError) throw mealsError;

    return {
      id: scheduleId,
      traineeId,
      weekStartDate,
      meals: meals.map(meal => ({
        id: meal.id,
        mealId: meal.meal_id,
        dayOfWeek: meal.day_of_week,
        timing: meal.timing,
        mealName: meal.meals?.name,
        calories: meal.meals?.calories
      }))
    };
  } catch (error) {
    console.error('Error fetching meal schedule:', error);
    throw error;
  }
};

export const assignMeal = async (
  scheduleId: string,
  mealId: string,
  dayOfWeek: number,
  timing: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): Promise<void> => {
  if (!isSupabaseConnected()) {
    console.log('Mock assign meal:', { scheduleId, mealId, dayOfWeek, timing });
    return;
  }

  try {
    const { error } = await supabase
      .from('schedule_meals')
      .insert({
        schedule_id: scheduleId,
        meal_id: mealId,
        day_of_week: dayOfWeek,
        timing
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error assigning meal:', error);
    throw error;
  }
};

export const removeMeal = async (mealId: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    console.log('Mock remove meal:', mealId);
    return;
  }

  try {
    const { error } = await supabase
      .from('schedule_meals')
      .delete()
      .eq('id', mealId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing meal:', error);
    throw error;
  }
};