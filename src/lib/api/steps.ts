import { supabase, isSupabaseConnected } from '../supabase';

export interface StepData {
  id: string;
  traineeId: string;
  date: string;
  steps: number;
  targetSteps: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get daily step count for a specific date
 */
export const getDailySteps = async (date: string = new Date().toISOString().split('T')[0]): Promise<StepData | null> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return {
      id: 'mock-id',
      traineeId: 'mock-trainee-id',
      date,
      steps: Math.floor(Math.random() * 2500) + 500,
      targetSteps: 3000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    // Get step data for the specified date
    const { data, error } = await supabase
      .from('trainee_steps')
      .select('*')
      .eq('trainee_id', user.id)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found for this date
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      traineeId: data.trainee_id,
      date: data.date,
      steps: data.steps,
      targetSteps: data.target_steps,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching daily steps:', error);
    throw error;
  }
};

/**
 * Get weekly step data
 */
export const getWeeklySteps = async (startDate?: string): Promise<StepData[]> => {
  if (!isSupabaseConnected()) {
    // Generate mock data for the week
    const today = new Date();
    const weekData: StepData[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      weekData.push({
        id: `mock-id-${i}`,
        traineeId: 'mock-trainee-id',
        date: dateStr,
        steps: Math.floor(Math.random() * 3500) + 500,
        targetSteps: 3000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return weekData;
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    // Calculate start date if not provided
    if (!startDate) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek;
      const sunday = new Date(today.setDate(diff));
      startDate = sunday.toISOString().split('T')[0];
    }

    // Calculate end date (7 days from start date)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    // Get step data for the week
    const { data, error } = await supabase
      .from('trainee_steps')
      .select('*')
      .eq('trainee_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      traineeId: item.trainee_id,
      date: item.date,
      steps: item.steps,
      targetSteps: item.target_steps,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  } catch (error) {
    console.error('Error fetching weekly steps:', error);
    throw error;
  }
};

/**
 * Update step count for a specific date
 */
export const updateStepCount = async (steps: number, date: string = new Date().toISOString().split('T')[0]): Promise<StepData> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return {
      id: 'mock-id',
      traineeId: 'mock-trainee-id',
      date,
      steps,
      targetSteps: 3000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    // Check if record exists for this date
    const { data: existingData, error: checkError } = await supabase
      .from('trainee_steps')
      .select('id')
      .eq('trainee_id', user.id)
      .eq('date', date)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let result;

    if (existingData) {
      // Update existing record
      const { data, error } = await supabase
        .from('trainee_steps')
        .update({
          steps,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('trainee_steps')
        .insert({
          trainee_id: user.id,
          date,
          steps,
          target_steps: 3000 // Default target
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return {
      id: result.id,
      traineeId: result.trainee_id,
      date: result.date,
      steps: result.steps,
      targetSteps: result.target_steps,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  } catch (error) {
    console.error('Error updating step count:', error);
    throw error;
  }
};

/**
 * Update target steps
 */
export const updateTargetSteps = async (targetSteps: number): Promise<void> => {
  if (!isSupabaseConnected()) {
    console.log('Mock: Updated target steps to', targetSteps);
    return;
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    // Update all future records for this user
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('trainee_steps')
      .update({
        target_steps: targetSteps,
        updated_at: new Date().toISOString()
      })
      .eq('trainee_id', user.id)
      .gte('date', today);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating target steps:', error);
    throw error;
  }
};