import { supabase, isSupabaseConnected } from '../supabase';

export interface WeeklySchedule {
  id: string;
  traineeId: string;
  weekStartDate: string;
  exercises: ScheduleExercise[];
}

export interface ScheduleExercise {
  id: string;
  exerciseId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  sets: number;
  reps: number;
  exerciseName?: string;
  exerciseCategory?: string;
}

// Validate UUID format
const isValidUUID = (uuid: string) => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const getWeeklySchedule = async (traineeId: string, weekStartDate: string): Promise<WeeklySchedule | null> => {
  if (!isSupabaseConnected()) {
    // Use valid UUID format for mock data
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      traineeId,
      weekStartDate,
      exercises: [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          exerciseId: '123e4567-e89b-12d3-a456-426614174010',
          dayOfWeek: 0,
          sets: 4,
          reps: 12,
          exerciseName: 'بنش بريس',
          exerciseCategory: 'chest'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          exerciseId: '123e4567-e89b-12d3-a456-426614174011',
          dayOfWeek: 2,
          sets: 4,
          reps: 12,
          exerciseName: 'سكوات',
          exerciseCategory: 'legs'
        }
      ]
    };
  }

  try {
    // Validate traineeId is a valid UUID
    if (!isValidUUID(traineeId)) {
      throw new Error('Invalid trainee ID format');
    }

    // Get schedule for the week - using maybeSingle() instead of single()
    const { data: schedule, error: scheduleError } = await supabase
      .from('weekly_schedules')
      .select('id')
      .eq('trainee_id', traineeId)
      .eq('week_start_date', weekStartDate)
      .maybeSingle();

    // If there's an error that's not a "no rows returned" error, throw it
    if (scheduleError && scheduleError.code !== 'PGRST116') throw scheduleError;

    // If no schedule exists, return null
    if (!schedule) return null;

    // Get exercises for the schedule
    const { data: exercises, error: exercisesError } = await supabase
      .from('schedule_exercises')
      .select(`
        id,
        exercise_id,
        day_of_week,
        sets,
        reps,
        exercises (
          name,
          category
        )
      `)
      .eq('schedule_id', schedule.id);

    if (exercisesError) throw exercisesError;

    return {
      id: schedule.id,
      traineeId,
      weekStartDate,
      exercises: exercises.map(ex => ({
        id: ex.id,
        exerciseId: ex.exercise_id,
        dayOfWeek: ex.day_of_week,
        sets: ex.sets,
        reps: ex.reps,
        exerciseName: ex.exercises?.name,
        exerciseCategory: ex.exercises?.category
      }))
    };
  } catch (error) {
    console.error('Error fetching weekly schedule:', error);
    throw error;
  }
};

export const createWeeklySchedule = async (traineeId: string, weekStartDate: string): Promise<WeeklySchedule> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return {
      id: '123e4567-e89b-12d3-a456-426614174000',
      traineeId,
      weekStartDate,
      exercises: []
    };
  }

  try {
    // Validate traineeId is a valid UUID
    if (!isValidUUID(traineeId)) {
      throw new Error('Invalid trainee ID format');
    }

    // Create a new schedule
    const { data: newSchedule, error: createError } = await supabase
      .from('weekly_schedules')
      .insert({ trainee_id: traineeId, week_start_date: weekStartDate })
      .select('id')
      .single();

    if (createError) throw createError;

    return {
      id: newSchedule.id,
      traineeId,
      weekStartDate,
      exercises: []
    };
  } catch (error) {
    console.error('Error creating weekly schedule:', error);
    throw error;
  }
};

export const assignExercise = async (
  scheduleId: string,
  exerciseId: string,
  dayOfWeek: number,
  sets: number,
  reps: number
): Promise<void> => {
  if (!isSupabaseConnected()) {
    console.log('Mock assign exercise:', { scheduleId, exerciseId, dayOfWeek, sets, reps });
    return;
  }

  try {
    const { error } = await supabase
      .from('schedule_exercises')
      .insert({
        schedule_id: scheduleId,
        exercise_id: exerciseId,
        day_of_week: dayOfWeek,
        sets,
        reps
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error assigning exercise:', error);
    throw error;
  }
};

export const removeExercise = async (exerciseId: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    console.log('Mock remove exercise:', exerciseId);
    return;
  }

  try {
    const { error } = await supabase
      .from('schedule_exercises')
      .delete()
      .eq('id', exerciseId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing exercise:', error);
    throw error;
  }
};