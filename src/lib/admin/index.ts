import { supabase, isSupabaseConnected } from '../supabase';

export const loginAdmin = async (email: string, password: string) => {
  if (!isSupabaseConnected()) {
    if (email === 'mk@powerhouse.com' && password === 'Admin@123') {
      localStorage.setItem('userType', 'admin');
      return { role: 'admin' };
    }
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  try {
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');

    // Verify admin role
    const { data: isAdmin } = await supabase!.rpc('verify_user_role', {
      p_user_id: data.user.id,
      p_role: 'admin'
    });

    if (!isAdmin) {
      throw new Error('غير مصرح لك بالدخول');
    }

    localStorage.setItem('userType', 'admin');
    return { role: 'admin' };

  } catch (error) {
    console.error('Error during login:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ أثناء تسجيل الدخول');
  }
};

export * from '../api/admin';