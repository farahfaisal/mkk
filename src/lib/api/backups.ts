import { supabase, isSupabaseConnected } from '../supabase';

export interface BackupVersion {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
  status: 'completed' | 'pending' | 'failed';
  size: number;
  path: string;
}

export const getBackupVersions = async (): Promise<BackupVersion[]> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  try {
    const { data, error } = await supabase
      .from('backup_versions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching backup versions:', error);
    throw new Error('حدث خطأ أثناء تحميل النسخ الاحتياطية');
  }
};

export const restoreBackup = async (backupId: string): Promise<void> => {
  if (!isSupabaseConnected()) {
    throw new Error('Database connection not available');
  }

  try {
    const { error } = await supabase.rpc('restore_backup', {
      backup_id: backupId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw new Error('حدث خطأ أثناء استعادة النسخة الاحتياطية');
  }
};