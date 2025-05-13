import { supabase, isSupabaseConnected } from '../supabase';

export interface Membership {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'inactive';
}

export const getMembershipDuration = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  if (today > end) {
    return 'منتهية';
  }

  const remainingDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const remainingMonths = Math.floor(remainingDays / 30);
  const extraDays = remainingDays % 30;

  if (remainingMonths > 0) {
    return extraDays > 0 
      ? `${remainingMonths} شهر و ${extraDays} يوم`
      : `${remainingMonths} شهر`;
  }

  return `${remainingDays} يوم`;
};

export const getUserMembership = async (userId: string | null | undefined): Promise<Membership | null> => {
  // Return mock data if Supabase is not connected or no userId is provided
  if (!isSupabaseConnected() || !userId) {
    return {
      id: 'basic',
      name: 'الخطة الأساسية',
      price: 99,
      duration: '1 شهر',
      features: ['برنامج تدريبي أساسي', 'برنامج غذائي أساسي'],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from('trainee_profiles')
      .select('subscription_plan, subscription_start, subscription_end')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching trainee profile:', profileError);
      return null;
    }
    
    if (!profile) return null;

    // Return basic subscription info if no plan is set
    if (!profile.subscription_plan) {
      return {
        id: 'basic',
        name: 'الخطة الأساسية',
        price: 0,
        duration: '1 شهر',
        features: ['برنامج تدريبي أساسي'],
        startDate: profile.subscription_start || new Date().toISOString(),
        endDate: profile.subscription_end || new Date().toISOString(),
        status: 'active'
      };
    }

    return {
      id: profile.subscription_plan,
      name: profile.subscription_plan === 'premium' ? 'الخطة المتقدمة' : 
            profile.subscription_plan === 'pro' ? 'الخطة الاحترافية' : 'الخطة الأساسية',
      price: profile.subscription_plan === 'premium' ? 199 : 
             profile.subscription_plan === 'pro' ? 299 : 99,
      duration: profile.subscription_plan === 'basic' ? '1 شهر' : '3 شهور',
      features: profile.subscription_plan === 'premium' 
        ? ['برنامج تدريبي متقدم', 'برنامج غذائي مخصص', 'متابعة يومية', 'جلسات خاصة']
        : profile.subscription_plan === 'pro'
        ? ['برنامج تدريبي احترافي', 'برنامج غذائي مخصص', 'متابعة يومية', 'جلسات خاصة', 'استشارات غير محدودة']
        : ['برنامج تدريبي أساسي', 'برنامج غذائي أساسي'],
      startDate: profile.subscription_start,
      endDate: profile.subscription_end,
      status: 'active'
    };
  } catch (error) {
    console.error('Error fetching membership:', error);
    return null;
  }
};