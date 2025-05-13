import { supabase, isSupabaseConnected } from '../supabase';

export interface TraineeProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  initial_weight: number;
  current_weight: number;
  target_weight: number;
  height: number;
  fat_percentage: number;
  muscle_mass: number;
  goal: string[];
  subscription_plan: string;
  subscription_start: string;
  subscription_end: string;
  status: 'active' | 'pending' | 'inactive';
  completed_exercises: number;
  completed_meals: number;
  created_at: string;
}

export const getTrainees = async (): Promise<TraineeProfile[]> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  try {
    const { data, error } = await supabase
      .from('trainee_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching trainees:', error);
    throw new Error('حدث خطأ أثناء تحميل المتدربين');
  }
};

export const getTraineeById = async (id: string): Promise<TraineeProfile> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  try {
    const { data, error } = await supabase
      .from('trainee_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Trainee not found');

    return data;
  } catch (error) {
    console.error('Error fetching trainee:', error);
    throw new Error('حدث خطأ أثناء تحميل بيانات المتدرب');
  }
};

export const updateTraineeStatus = async (
  id: string, 
  status: 'active' | 'pending' | 'inactive'
): Promise<void> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  try {
    const { error } = await supabase
      .from('trainee_profiles')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating trainee status:', error);
    throw new Error('حدث خطأ أثناء تحديث حالة المتدرب');
  }
};

export const updateTraineeProfile = async (
  id: string,
  data: Partial<TraineeProfile>
): Promise<void> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  try {
    const { error } = await supabase
      .from('trainee_profiles')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating trainee profile:', error);
    throw new Error('حدث خطأ أثناء تحديث بيانات المتدرب');
  }
};

export const deleteTrainee = async (id: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  try {
    const { error } = await supabase
      .from('trainee_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting trainee:', error);
    throw new Error('حدث خطأ أثناء حذف المتدرب');
  }
};