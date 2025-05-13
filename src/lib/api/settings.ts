import { supabase, isSupabaseConnected } from '../supabase';

export interface AppSettings {
  id: string;
  category: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const getSettings = async (category: string = 'general'): Promise<AppSettings> => {
  if (!isSupabaseConnected()) {
    // Return mock data
    return {
      id: '1',
      category,
      settings: getMockSettings(category),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('category', category)
    .single();

  if (error) throw error;
  return data;
};

export const updateSettings = async (category: string, settings: Record<string, any>): Promise<AppSettings> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      category,
      settings,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

function getMockSettings(category: string): Record<string, any> {
  switch (category) {
    case 'general':
      return {
        appName: 'MK',
        appDescription: 'منصة تدريب رياضي متكاملة',
        contactEmail: 'contact@powerhouse.com',
        contactPhone: '+970 59 123 4567'
      };

    case 'security':
      return {
        twoFactorAuth: false,
        emailVerification: true
      };

    case 'notifications':
      return {
        emailNotifications: true,
        appNotifications: true
      };

    case 'appearance':
      return {
        theme: 'dark',
        primaryColor: '#0AE7F2'
      };

    default:
      return {};
  }
}