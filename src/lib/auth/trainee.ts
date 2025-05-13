import { supabase, isSupabaseConnected } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

export interface TraineeLoginResponse {
  user: {
    id: string;
    email: string;
  };
  profile: {
    name: string;
    email: string;
    phone: string;
    plan: string;
    status: string;
    height: number;
    weight: number;
    targetWeight: number;
    goals: string[];
    gender?: string;
    stats?: {
      completedExercises: number;
      completedMeals: number;
      progress: number;
    };
  };
}

export const loginTrainee = async (email: string, password: string): Promise<TraineeLoginResponse> => {
  if (!isSupabaseConnected()) {
    // Test trainee credentials for development
    if (email === 'user@powerhouse.com' && password === 'User@123') {
      return {
        user: {
          id: 'test-trainee-id',
          email: 'user@powerhouse.com'
        },
        profile: {
          name: 'أحمد محمد',
          email: 'user@powerhouse.com',
          phone: '970 59 123 4567',
          plan: 'premium',
          status: 'active',
          height: 175,
          weight: 80,
          targetWeight: 75,
          goals: ['weight_loss', 'muscle_gain'],
          gender: 'male',
          stats: {
            completedExercises: 45,
            completedMeals: 38,
            progress: 75
          }
        }
      };
    }
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
      throw error;
    }

    if (!data.user) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Get trainee profile
    const { data: traineeData, error: traineeError } = await supabase
      .from('trainee_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (traineeError) {
      if (traineeError.code === 'PGRST116') {
        throw new Error('لم يتم العثور على الملف الشخصي');
      }
      throw traineeError;
    }

    // Check if trainee is active
    if (traineeData.status !== 'active') {
      throw new Error('الحساب غير نشط. يرجى التواصل مع المدير');
    }

    // Get trainee performance stats
    const { data: performanceData } = await supabase
      .from('trainee_performance')
      .select('completed_exercises, completed_meals, progress_value')
      .eq('trainee_id', data.user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    return {
      user: {
        id: data.user.id,
        email: data.user.email || ''
      },
      profile: {
        name: traineeData.name,
        email: traineeData.email,
        phone: traineeData.phone || '',
        plan: traineeData.subscription_plan,
        status: traineeData.status,
        height: traineeData.height || 0,
        weight: traineeData.current_weight || 0,
        targetWeight: traineeData.target_weight || 0,
        goals: traineeData.goal || [],
        gender: traineeData.gender || 'male',
        stats: performanceData ? {
          completedExercises: performanceData.completed_exercises || 0,
          completedMeals: performanceData.completed_meals || 0,
          progress: performanceData.progress_value || 0
        } : undefined
      }
    };
  } catch (error) {
    console.error('Error during login:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ أثناء تسجيل الدخول');
  }
};

export const registerTrainee = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  height: number,
  weight: number,
  targetWeight: number,
  goals: string[],
  plan: string = 'basic',
  gender: string = 'male'
): Promise<{ success: boolean; userId?: string; error?: string }> => {
  if (!isSupabaseConnected()) {
    // Mock registration for development
    return {
      success: true,
      userId: uuidv4()
    };
  }

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('trainee_profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'البريد الإلكتروني مسجل مسبقاً'
      };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'trainee'
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('فشل إنشاء المستخدم');

    // Create trainee profile
    const { error: profileError } = await supabase
      .from('trainee_profiles')
      .insert([{
        id: authData.user.id,
        name,
        email,
        phone,
        password_hash: password, // Will be hashed by database trigger
        initial_weight: weight,
        current_weight: weight,
        target_weight: targetWeight,
        height,
        fat_percentage: 0,
        muscle_mass: 0,
        goal: goals,
        subscription_plan: plan,
        status: 'active',
        role: 'trainee',
        gender: gender
      }]);

    if (profileError) {
      // Try to clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return {
      success: true,
      userId: authData.user.id
    };
  } catch (error) {
    console.error('Error during registration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ أثناء التسجيل'
    };
  }
};

export const getTraineeProfile = async (): Promise<TraineeLoginResponse['profile'] | null> => {
  if (!isSupabaseConnected()) {
    // Check if we have stored profile in localStorage
    const storedProfile = localStorage.getItem('traineeProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        return {
          name: profile.name || 'أحمد محمد',
          email: profile.email || 'user@powerhouse.com',
          phone: profile.phone || '970 59 123 4567',
          plan: profile.plan || 'premium',
          status: profile.status || 'active',
          height: profile.height || 175,
          weight: profile.weight || 80,
          targetWeight: profile.targetWeight || 75,
          goals: profile.goals || ['weight_loss', 'muscle_gain'],
          gender: profile.gender || 'male',
          stats: {
            completedExercises: 45,
            completedMeals: 38,
            progress: 75
          }
        };
      } catch (e) {
        console.error('Error parsing stored profile:', e);
      }
    }
    
    // Mock profile for development
    return {
      name: 'أحمد محمد',
      email: 'user@powerhouse.com',
      phone: '970 59 123 4567',
      plan: 'premium',
      status: 'active',
      height: 175,
      weight: 80,
      targetWeight: 75,
      goals: ['weight_loss', 'muscle_gain'],
      gender: 'male',
      stats: {
        completedExercises: 45,
        completedMeals: 38,
        progress: 75
      }
    };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('trainee_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    if (!profile) return null;

    // Get trainee performance stats
    const { data: performanceData } = await supabase
      .from('trainee_performance')
      .select('completed_exercises, completed_meals, progress_value')
      .eq('trainee_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    return {
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      plan: profile.subscription_plan,
      status: profile.status,
      height: profile.height || 0,
      weight: profile.current_weight || 0,
      targetWeight: profile.target_weight || 0,
      goals: profile.goal || [],
      gender: profile.gender || 'male',
      stats: performanceData ? {
        completedExercises: performanceData.completed_exercises || 0,
        completedMeals: performanceData.completed_meals || 0,
        progress: performanceData.progress_value || 0
      } : undefined
    };
  } catch (error) {
    console.error('Error fetching trainee profile:', error);
    return null;
  }
};