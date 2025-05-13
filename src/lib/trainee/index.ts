import { supabase, isSupabaseConnected } from '../supabase';

export const loginTrainee = async (email: string, password: string) => {
  if (!isSupabaseConnected()) {
    // Test trainee credentials
    if (email === 'user@powerhouse.com' && password === 'User@123') {
      localStorage.setItem('userType', 'user');
      return {
        user: {
          id: 'test-trainee-id',
          email: 'user@powerhouse.com'
        },
        profile: {
          name: 'محمد خلف',
          email: 'user@powerhouse.com',
          phone: '970 59 123 4567',
          plan: 'premium',
          status: 'active',
          height: 175,
          weight: 80,
          targetWeight: 75,
          goals: ['weight_loss', 'muscle_gain'],
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
    const { data, error } = await supabase!.auth.signInWithPassword({
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

    // Verify trainee role
    const { data: isTrainee } = await supabase!.rpc('verify_user_role', {
      p_user_id: data.user.id,
      p_role: 'trainee'
    });

    if (!isTrainee) {
      throw new Error('غير مصرح لك بالدخول');
    }

    // Get trainee profile
    const { data: traineeData, error: traineeError } = await supabase!
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

    return { user: data.user, profile: traineeData };

  } catch (error) {
    console.error('Error during login:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ أثناء تسجيل الدخول');
  }
};

export const registerTrainee = async (email: string, password: string, name: string) => {
  if (!isSupabaseConnected()) {
    throw new Error('لا يمكن الاتصال بقاعدة البيانات');
  }

  try {
    // Create auth user
    const { data: { user }, error: authError } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'trainee'
        }
      }
    });

    if (authError) throw authError;
    if (!user) throw new Error('حدث خطأ أثناء إنشاء الحساب');

    // Create trainee profile
    const { data: trainee, error: traineeError } = await supabase!
      .from('trainee_profiles')
      .insert([{
        id: user.id,
        name,
        email,
        password_hash: password, // Will be hashed by database trigger
        initial_weight: 0,
        current_weight: 0,
        target_weight: 0,
        height: 0,
        fat_percentage: 0,
        muscle_mass: 0,
        goal: ['weight_loss'],
        subscription_plan: 'basic',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }])
      .select()
      .single();

    if (traineeError) {
      if (traineeError.code === '23505') {
        throw new Error('هذا البريد الإلكتروني مسجل مسبقاً');
      }
      throw traineeError;
    }

    return trainee;

  } catch (error) {
    console.error('Error during registration:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ أثناء إنشاء الحساب');
  }
};

export * from '../api/trainee';