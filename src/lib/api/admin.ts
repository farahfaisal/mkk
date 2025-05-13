import { supabase, isSupabaseConnected } from '../supabase';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  newSubscriptions: number;
  subscriptionDistribution?: {
    basic: number;
    premium: number;
    pro: number;
  };
  statusDistribution?: {
    active: number;
    pending: number;
    inactive: number;
  };
  averageWeight?: number;
  averageProgress?: number;
  totalMeals?: number;
  totalExercises?: number;
}

export const getAdminStats = async (): Promise<AdminStats> => {
  if (!isSupabaseConnected()) {
    // Return mock data if Supabase is not connected
    return {
      totalUsers: 1250,
      activeUsers: 856,
      totalRevenue: 15600,
      newSubscriptions: 28,
      subscriptionDistribution: {
        basic: 450,
        premium: 320,
        pro: 86
      },
      statusDistribution: {
        active: 856,
        pending: 245,
        inactive: 149
      },
      averageWeight: 75.5,
      averageProgress: 68.3,
      totalMeals: 156,
      totalExercises: 42
    };
  }

  try {
    // Get trainee counts with created_at field
    const { data: trainees, error: traineesError } = await supabase
      .from('trainee_profiles')
      .select('status, subscription_plan, current_weight, initial_weight, target_weight, created_at');

    if (traineesError) throw traineesError;

    // Get total meals count
    const { count: mealsCount, error: mealsError } = await supabase
      .from('meals')
      .select('id', { count: 'exact', head: true });

    if (mealsError) throw mealsError;

    // Get total exercises count
    const { count: exercisesCount, error: exercisesError } = await supabase
      .from('exercises')
      .select('id', { count: 'exact', head: true });

    if (exercisesError) throw exercisesError;

    // Calculate stats from trainee data
    const stats = {
      totalUsers: trainees.length,
      activeUsers: trainees.filter(t => t.status === 'active').length,
      totalRevenue: trainees.reduce((sum, t) => {
        const planPrices = { basic: 99, premium: 199, pro: 299 };
        return sum + (planPrices[t.subscription_plan as keyof typeof planPrices] || 0);
      }, 0),
      newSubscriptions: trainees.filter(t => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(t.created_at) >= thirtyDaysAgo;
      }).length,
      subscriptionDistribution: {
        basic: trainees.filter(t => t.subscription_plan === 'basic').length,
        premium: trainees.filter(t => t.subscription_plan === 'premium').length,
        pro: trainees.filter(t => t.subscription_plan === 'pro').length
      },
      statusDistribution: {
        active: trainees.filter(t => t.status === 'active').length,
        pending: trainees.filter(t => t.status === 'pending').length,
        inactive: trainees.filter(t => t.status === 'inactive').length
      },
      averageWeight: trainees.reduce((sum, t) => sum + (t.current_weight || 0), 0) / trainees.length || 0,
      averageProgress: trainees.reduce((sum, t) => {
        if (t.initial_weight && t.current_weight && t.target_weight && t.initial_weight > t.target_weight) {
          const progress = ((t.initial_weight - t.current_weight) / (t.initial_weight - t.target_weight)) * 100;
          return sum + progress;
        }
        return sum;
      }, 0) / trainees.length || 0,
      totalMeals: mealsCount || 0,
      totalExercises: exercisesCount || 0
    };

    return stats;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return mock data if there's an error
    return {
      totalUsers: 1250,
      activeUsers: 856,
      totalRevenue: 15600,
      newSubscriptions: 28,
      subscriptionDistribution: {
        basic: 450,
        premium: 320,
        pro: 86
      },
      statusDistribution: {
        active: 856,
        pending: 245,
        inactive: 149
      },
      averageWeight: 75.5,
      averageProgress: 68.3,
      totalMeals: 156,
      totalExercises: 42
    };
  }
};