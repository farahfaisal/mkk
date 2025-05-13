import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Download, Calendar, HardDrive, RefreshCw } from 'lucide-react';
import { BackupVersion, getBackupVersions, restoreBackup } from '../lib/api/backups';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BackupVersionsProps {
  onBack: () => void;
}

export function BackupVersions({ onBack }: BackupVersionsProps) {
  const [backups, setBackups] = useState<BackupVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [autoRestoreAttempted, setAutoRestoreAttempted] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  useEffect(() => {
    // Auto-restore March 24th backup when backups are loaded
    if (!autoRestoreAttempted && backups.length > 0 && !loading && !error) {
      const march24Backup = backups.find(backup => 
        new Date(backup.created_at).toISOString().startsWith('2024-03-24')
      );

      if (march24Backup) {
        handleRestore(march24Backup.id, true);
      }
      setAutoRestoreAttempted(true);
    }
  }, [backups, loading, error, autoRestoreAttempted]);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await getBackupVersions();
      setBackups(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching backups:', err);
      setError('حدث خطأ أثناء تحميل النسخ الاحتياطية');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId: string, isAutoRestore = false) => {
    if (!isAutoRestore && !confirm('هل أنت متأكد من استعادة هذه النسخة؟ سيتم استبدال جميع البيانات الحالية.')) {
      return;
    }

    try {
      setRestoring(true);
      setSelectedBackup(backupId);
      await restoreBackup(backupId);
      
      if (!isAutoRestore) {
        alert('تم استعادة النسخة الاحتياطية بنجاح');
      }
      
      window.location.reload();
    } catch (err) {
      console.error('Error restoring backup:', err);
      const errorMessage = 'حدث خطأ أثناء استعادة النسخة الاحتياطية';
      if (isAutoRestore) {
        setError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setRestoring(false);
      setSelectedBackup(null);
    }
  };

  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
        {error}
      </div>
    );
  }

  const march24Backup = backups.find(backup => 
    new Date(backup.created_at).toISOString().startsWith('2024-03-24')
  );

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0F1C] text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM32 0l-9.9 9.9 1.414 1.414L33.414 1.414 32 0zm-3.172 0L19.757 9.071l1.415 1.414L31.243 0h-2.415zm-5.656 0L14.343 8.828l1.415 1.415L25.586 0h-2.415zm-5.656 0L8.687 8.828 10.1 10.243 20.93 0h-3.414zM28.828 0L27.414 1.414 33.414 7.414V0h-4.586zm-9.656 0L17.757 1.414 23.757 7.414V0h-4.585zm-9.657 0L8.1 1.414l6 6V0H9.516zM0 0c0 .828.635 1.5 1.414 1.5.793 0 1.414-.672 1.414-1.5H0zm0 4.172l4.172 4.172 1.415-1.415L1.414 2.757 0 4.172zm0 5.656l9.828 9.828 1.414-1.414L1.414 8.414 0 9.828zm0 5.656l14.485 14.485 1.414-1.414L1.414 14.07 0 15.485zm0 5.657l19.142 19.142 1.414-1.414L1.414 19.728 0 21.142zm0 5.657l23.8 23.8 1.414-1.414L1.414 25.385 0 26.8zm0 5.657l28.456 28.457 1.414-1.414L1.414 31.042 0 32.456zm0 5.657l33.113 33.114 1.414-1.414L1.414 36.7 0 38.113zm0 5.657l37.77 37.77 1.415-1.414L1.414 42.356 0 43.77zm0 5.657l42.427 42.428 1.414-1.414L1.414 48.013 0 49.427zm0 5.657l47.084 47.085 1.414-1.414L1.414 53.67 0 55.084zm0 5.657l51.741 51.741 1.414-1.414L1.414 59.327 0 60.741zm0 5.657l56.398 56.398 1.414-1.414L1.414 65.084 0 66.498zm60.741 0L0 5.757 1.414 4.343 60.74 63.67l-1.414 1.414z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#1A1F2E]/80 backdrop-blur-lg border-b border-[#0AE7F2]/20">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button onClick={onBack} className="text-white/80 hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-bold">النسخ الاحتياطية</h1>
              <div className="w-6"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {march24Backup ? (
            <div className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-2xl border border-[#0AE7F2]/20 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0AE7F2]/10 p-3 rounded-xl">
                    <HardDrive size={24} className="text-[#0AE7F2]" />
                  </div>
                  <div>
                    <h3 className="font-bold">نسخة 24 مارس</h3>
                    <p className="text-sm text-gray-400">النسخة المطلوب استعادتها</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRestore(march24Backup.id)}
                  disabled={restoring}
                  className="bg-[#0AE7F2] text-black px-4 py-2 rounded-xl hover:bg-[#0AE7F2]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {restoring && selectedBackup === march24Backup.id ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>جاري الاستعادة...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={20} />
                      <span>استعادة</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#0AE7F2]" />
                  <span>
                    {formatDistanceToNow(new Date(march24Backup.created_at), {
                      addSuffix: true,
                      locale: ar
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-[#0AE7F2]" />
                  <span>{formatSize(march24Backup.size)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500 text-amber-500 p-4 rounded-xl text-center mb-8">
              لم يتم العثور على نسخة احتياطية لتاريخ 24 مارس
            </div>
          )}

          <h2 className="text-lg font-bold mb-4">جميع النسخ الاحتياطية</h2>
          
          {backups.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-[#0AE7F2]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database size={32} className="text-[#0AE7F2]" />
              </div>
              <h3 className="text-lg font-bold mb-2">لا توجد نسخ احتياطية</h3>
              <p className="text-gray-400">لم يتم العثور على أي نسخ احتياطية</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div 
                  key={backup.id}
                  className="bg-[#1A1F2E]/60 backdrop-blur-sm rounded-2xl border border-[#0AE7F2]/20 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#0AE7F2]/10 p-3 rounded-xl">
                        <HardDrive size={24} className="text-[#0AE7F2]" />
                      </div>
                      <div>
                        <h3 className="font-bold">{backup.name}</h3>
                        {backup.description && (
                          <p className="text-sm text-gray-400">{backup.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleRestore(backup.id)}
                        disabled={restoring}
                        className="bg-[#0AE7F2]/10 text-[#0AE7F2] p-2 rounded-xl hover:bg-[#0AE7F2]/20 transition-colors disabled:opacity-50"
                        title="استعادة النسخة الاحتياطية"
                      >
                        {restoring && selectedBackup === backup.id ? (
                          <RefreshCw size={20} className="animate-spin" />
                        ) : (
                          <RefreshCw size={20} />
                        )}
                      </button>
                      <button 
                        className="bg-[#0AE7F2]/10 text-[#0AE7F2] p-2 rounded-xl hover:bg-[#0AE7F2]/20 transition-colors"
                        title="تحميل النسخة الاحتياطية"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#0AE7F2]" />
                      <span>
                        {formatDistanceToNow(new Date(backup.created_at), {
                          addSuffix: true,
                          locale: ar
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database size={16} className="text-[#0AE7F2]" />
                      <span>{formatSize(backup.size)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}