import { supabase, isSupabaseConnected } from './supabase';
import { loginTrainee, registerTrainee } from './auth/trainee';

export const login = async (email: string, password: string) => {
  if (!isSupabaseConnected()) {
    // Test credentials
    if (email === 'mk@powerhouse.com' && password === 'Admin@123') {
      localStorage.setItem('userType', 'admin');
      return { success: true, role: 'admin' };
    }

    // Check trainee credentials
    if (email === 'user@powerhouse.com' && password === 'User@123') {
      localStorage.setItem('userType', 'user');
      return { success: true, role: 'user' };
    }

    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  try {
    // Sign in with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;
    if (!user) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');

    // Check if user is admin
    if (email === 'mk@powerhouse.com') {
      localStorage.setItem('userType', 'admin');
      return { success: true, role: 'admin' };
    }

    // Check trainee profile
    const { data: trainee, error: traineeError } = await supabase
      .from('trainee_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (traineeError) throw traineeError;
    if (!trainee) throw new Error('لم يتم العثور على الملف الشخصي');

    // Check if trainee is active
    if (trainee.status !== 'active') {
      throw new Error('الحساب غير نشط. يرجى التواصل مع المدير');
    }

    localStorage.setItem('userType', 'user');
    localStorage.setItem('traineeProfile', JSON.stringify(trainee));
    localStorage.setItem('traineeId', user.id);
    
    return { success: true, role: 'user', trainee };

  } catch (error) {
    console.error('Error during login:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ أثناء تسجيل الدخول');
  }
};

export const logout = async () => {
  const userType = localStorage.getItem('userType');
  
  if (isSupabaseConnected()) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  // Clear all localStorage items
  localStorage.removeItem('userType');
  localStorage.removeItem('traineeProfile');
  localStorage.removeItem('traineeId');
  localStorage.removeItem('savedTraineeEmail');
  localStorage.removeItem('savedTraineePassword');
  
  // Redirect based on user type
  if (userType === 'user') {
    window.location.href = '/trainee/login';
  } else {
    window.location.href = '/';
  }
};

export {
  loginTrainee,
  registerTrainee
};