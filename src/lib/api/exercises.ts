import { supabase, isSupabaseConnected } from '../supabase';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: number;
  description?: string;
  videoUrl?: string;
  status?: string;
}

const mockExercises: Exercise[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174010',
    name: 'بنش بريس بالبار',
    category: 'chest',
    sets: 4,
    reps: 12,
    description: 'تمرين أساسي لتقوية عضلات الصدر باستخدام البار',
    status: 'active'
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174011',
    name: 'سكوات',
    category: 'legs',
    sets: 4,
    reps: 12,
    description: 'تمرين أساسي لتقوية عضلات الأرجل',
    status: 'active'
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174012',
    name: 'ديدليفت',
    category: 'back',
    sets: 4,
    reps: 10,
    description: 'تمرين أساسي لتقوية عضلات الظهر والأرجل',
    status: 'active'
  }
];

export const getExercises = async (): Promise<Exercise[]> => {
  if (!isSupabaseConnected()) {
    console.log('Using mock data - Supabase not connected');
    return mockExercises;
  }

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('حدث خطأ أثناء تحميل التمارين');
    }

    if (!data || data.length === 0) {
      console.log('No exercises found, returning mock data');
      return mockExercises;
    }

    return data.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      sets: exercise.sets,
      reps: exercise.reps,
      description: exercise.description,
      videoUrl: exercise.video_url,
      status: exercise.status
    }));
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ أثناء تحميل التمارين');
  }
};

export const updateExercise = async (id: string, data: Partial<Exercise>): Promise<Exercise> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  try {
    const { data: updatedExercise, error } = await supabase
      .from('exercises')
      .update({
        name: data.name,
        category: data.category,
        sets: data.sets,
        reps: data.reps,
        description: data.description,
        video_url: data.videoUrl
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('حدث خطأ أثناء تحديث التمرين');
    }

    if (!updatedExercise) {
      throw new Error('لم يتم العثور على التمرين');
    }

    return {
      id: updatedExercise.id,
      name: updatedExercise.name,
      category: updatedExercise.category,
      sets: updatedExercise.sets,
      reps: updatedExercise.reps,
      description: updatedExercise.description,
      videoUrl: updatedExercise.video_url,
      status: updatedExercise.status
    };
  } catch (error) {
    console.error('Error updating exercise:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ أثناء تحديث التمرين');
  }
};

export const getExercise = async (id: string): Promise<Exercise> => {
  if (!isSupabaseConnected()) {
    const mockExercise = mockExercises.find(e => e.id === id);
    if (mockExercise) return mockExercise;
    throw new Error('لم يتم العثور على التمرين');
  }

  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('حدث خطأ أثناء تحميل التمرين');
    }

    if (!data) {
      throw new Error('لم يتم العثور على التمرين');
    }

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      sets: data.sets,
      reps: data.reps,
      description: data.description,
      videoUrl: data.video_url,
      status: data.status
    };
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ أثناء تحميل التمرين');
  }
};

export const addExercise = async (exercise: Omit<Exercise, 'id' | 'status'>): Promise<Exercise> => {
  if (!isSupabaseConnected()) {
    return {
      id: `mock-${Date.now()}`,
      ...exercise,
      status: 'active'
    };
  }

  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert([{
        name: exercise.name,
        category: exercise.category,
        sets: exercise.sets,
        reps: exercise.reps,
        description: exercise.description,
        video_url: exercise.videoUrl,
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('حدث خطأ أثناء إضافة التمرين');
    }

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      sets: data.sets,
      reps: data.reps,
      description: data.description,
      videoUrl: data.video_url,
      status: data.status
    };
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ أثناء إضافة التمرين');
  }
};

export const deleteExercise = async (id: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    return;
  }

  try {
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('حدث خطأ أثناء حذف التمرين');
    }
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ أثناء حذف التمرين');
  }
};