import { supabase, isSupabaseConnected } from '../supabase';

export interface WeightRecord {
  id: string;
  userId: string;
  weight: number;
  date: string;
  notes?: string;
}

export const submitWeeklyWeight = async (weight: number, notes?: string): Promise<WeightRecord> => {
  if (!isSupabaseConnected()) {
    // Mock data for development
    return {
      id: Date.now().toString(),
      userId: 'test-user-id',
      weight,
      date: new Date().toISOString(),
      notes
    };
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Insert weight record
    const { data: weightRecord, error: weightError } = await supabase
      .from('weight_records')
      .insert({
        user_id: user.id,
        weight,
        date: dateStr,
        notes
      })
      .select()
      .single();

    if (weightError) throw weightError;

    // Update trainee profile with new weight
    const { error: traineeError } = await supabase
      .from('trainee_profiles')
      .update({ 
        current_weight: weight,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (traineeError) throw traineeError;

    // Update local storage
    const storedProfile = localStorage.getItem('traineeProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      profile.weight = weight;
      localStorage.setItem('traineeProfile', JSON.stringify(profile));
    }

    return {
      id: weightRecord.id,
      userId: weightRecord.user_id,
      weight: weightRecord.weight,
      date: weightRecord.date,
      notes: weightRecord.notes
    };
  } catch (error) {
    console.error('Error submitting weight:', error);
    throw error;
  }
};

export const getWeightHistory = async (): Promise<WeightRecord[]> => {
  if (!isSupabaseConnected()) {
    // Return mock data for development
    return [
      {
        id: '1',
        userId: 'test-user-id',
        weight: 80,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        userId: 'test-user-id',
        weight: 79.5,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        userId: 'test-user-id',
        weight: 81,
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    const { data, error } = await supabase
      .from('weight_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      userId: record.user_id,
      weight: record.weight,
      date: record.date,
      notes: record.notes
    }));
  } catch (error) {
    console.error('Error fetching weight history:', error);
    throw error;
  }
};

export const updateTraineeWeight = async (weight: number): Promise<void> => {
  if (!isSupabaseConnected()) {
    // Update local storage for development
    const storedProfile = localStorage.getItem('traineeProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      profile.weight = weight;
      localStorage.setItem('traineeProfile', JSON.stringify(profile));
    }
    return;
  }

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('المستخدم غير مسجل الدخول');

    // Update trainee profile with new weight
    const { error } = await supabase
      .from('trainee_profiles')
      .update({ 
        current_weight: weight,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;

    // Update local storage
    const storedProfile = localStorage.getItem('traineeProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      profile.weight = weight;
      localStorage.setItem('traineeProfile', JSON.stringify(profile));
    }
  } catch (error) {
    console.error('Error updating trainee weight:', error);
    throw error;
  }
};