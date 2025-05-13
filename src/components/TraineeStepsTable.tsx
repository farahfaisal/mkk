import React, { useState, useEffect } from 'react';
import { ArrowLeft, Footprints, Target, Search, Filter, Edit2, Save, X, Loader2, RefreshCw, Download } from 'lucide-react';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { formatDate } from '../lib/utils/date';
import { useNavigate } from 'react-router-dom';

interface TraineeStepsTableProps {
  onBack: () => void;
}

interface TraineeStepData {
  id: string;
  traineeId: string;
  traineeName: string;
  date: string;
  steps: number;
  targetSteps: number;
  progress: number;
  isEditing?: boolean;
}

export function TraineeStepsTable({ onBack }: TraineeStepsTableProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stepsData, setStepsData] = useState<TraineeStepData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStepsData();
  }, []);

  const fetchStepsData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        // Get all trainees
        const { data: trainees, error: traineesError } = await supabase
          .from('trainee_profiles')
          .select('id, name, email')
          .neq('email', 'mk@powerhouse.com');

        if (traineesError) throw traineesError;

        // Get steps data for all trainees
        const today = new Date().toISOString().split('T')[0];
        const { data: stepsData, error: stepsError } = await supabase
          .from('trainee_steps')
          .select('*')
          .eq('date', today);

        if (stepsError) throw stepsError;

        // Create a map of trainee ID to steps data
        const stepsMap = new Map();
        stepsData?.forEach(step => {
          stepsMap.set(step.trainee_id, step);
        });

        // Combine trainee and steps data
        const combinedData = trainees.map(trainee => {
          const stepData = stepsMap.get(trainee.id);
          return {
            id: stepData?.id || `temp-${trainee.id}`,
            traineeId: trainee.id,
            traineeName: trainee.name,
            date: today,
            steps: stepData?.steps || 0,
            targetSteps: stepData?.target_steps || 3000,
            progress: stepData ? Math.round((stepData.steps / stepData.target_steps) * 100) : 0
          };
        });

        setStepsData(combinedData);
      } else {
        // Mock data for development
        const mockData = [
          {
            id: '1',
            traineeId: '1',
            traineeName: 'أحمد محمد',
            date: new Date().toISOString().split('T')[0],
            steps: 5432,
            targetSteps: 8000,
            progress: 68
          },
          {
            id: '2',
            traineeId: '2',
            traineeName: 'سارة علي',
            date: new Date().toISOString().split('T')[0],
            steps: 7890,
            targetSteps: 10000,
            progress: 79
          },
          {
            id: '3',
            traineeId: '3',
            traineeName: 'محمد خالد',
            date: new Date().toISOString().split('T')[0],
            steps: 3245,
            targetSteps: 5000,
            progress: 65
          },
          {
            id: '4',
            traineeId: '4',
            traineeName: 'فاطمة أحمد',
            date: new Date().toISOString().split('T')[0],
            steps: 9876,
            targetSteps: 12000,
            progress: 82
          },
          {
            id: '5',
            traineeId: '5',
            traineeName: 'عمر حسن',
            date: new Date().toISOString().split('T')[0],
            steps: 2345,
            targetSteps: 6000,
            progress: 39
          }
        ];
        setStepsData(mockData);
      }
    } catch (err) {
      console.error('Error fetching steps data:', err);
      setError('حدث خطأ أثناء تحميل بيانات الخطوات');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTargetSteps = (id: string) => {
    setStepsData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isEditing: true } : item
      )
    );
  };

  const handleCancelEdit = (id: string) => {
    setStepsData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isEditing: false } : item
      )
    );
  };

  const handleChangeTargetSteps = (id: string, value: number) => {
    setStepsData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, targetSteps: Math.max(1000, Math.min(20000, value)) } : item
      )
    );
  };

  const handleSaveTargetSteps = async (id: string) => {
    try {
      setSavingId(id);
      const stepData = stepsData.find(item => item.id === id);
      if (!stepData) return;

      if (isSupabaseConnected()) {
        if (id.startsWith('temp-')) {
          // Insert new record
          const { error } = await supabase
            .from('trainee_steps')
            .insert({
              trainee_id: stepData.traineeId,
              date: stepData.date,
              steps: stepData.steps,
              target_steps: stepData.targetSteps
            });

          if (error) throw error;
        } else {
          // Update existing record
          const { error } = await supabase
            .from('trainee_steps')
            .update({
              target_steps: stepData.targetSteps,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);

          if (error) throw error;
        }

        // Update all future records for this trainee
        await supabase.rpc('update_trainee_target_steps', {
          p_trainee_id: stepData.traineeId,
          p_target_steps: stepData.targetSteps
        });
      }

      // Update local state
      setStepsData(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isEditing: false } : item
        )
      );
    } catch (err) {
      console.error('Error saving target steps:', err);
      setError('حدث خطأ أثناء حفظ الخطوات المستهدفة');
    } finally {
      setSavingId(null);
    }
  };

  const filteredData = stepsData.filter(item => {
    const matchesSearch = item.traineeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = !dateFilter || item.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 75) return 'bg-[#0AE7F2]';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getProgressTextColor = (progress: number) => {
    if (progress >= 100) return 'text-emerald-500';
    if (progress >= 75) return 'text-[#0AE7F2]';
    if (progress >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const exportToCSV = () => {
    const headers = ['اسم المتدرب', 'التاريخ', 'الخطوات', 'الخطوات المستهدفة', 'نسبة الإنجاز'];
    const rows = filteredData.map(item => [
      item.traineeName,
      item.date,
      item.steps.toString(),
      item.targetSteps.toString(),
      `${item.progress}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `خطوات_المتدربين_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackButton = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin');
    }
  };

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
              <button 
                onClick={handleBackButton}
                className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
              >
                <ArrowLeft size={20} className="text-[#0AE7F2]" />
              </button>
              <h1 className="text-xl font-bold">جدول الخطوات المستهدفة</h1>
              <div className="flex gap-2">
                <button 
                  onClick={fetchStepsData}
                  className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
                >
                  <RefreshCw size={20} className={`text-[#0AE7F2] ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={exportToCSV}
                  className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
                >
                  <Download size={20} className="text-[#0AE7F2]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Search and Filters */}
          <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">البحث والتصفية</h2>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="bg-[#0AE7F2]/10 text-[#0AE7F2] p-2 rounded-lg hover:bg-[#0AE7F2]/20 transition-colors"
              >
                <Filter size={20} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث عن متدرب..."
                className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-[#0AE7F2]"
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-[#1A1F2E] rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              {loading && !stepsData.length ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={40} className="text-[#0AE7F2] animate-spin" />
                </div>
              ) : error ? (
                <div className="p-6">
                  <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
                    {error}
                    <button 
                      onClick={fetchStepsData}
                      className="underline hover:no-underline mt-2 block w-full"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  لا توجد بيانات مطابقة للبحث
                </div>
              ) : (
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-right py-3 px-6 text-sm font-medium text-white/60">المتدرب</th>
                      <th className="text-right py-3 px-6 text-sm font-medium text-white/60">التاريخ</th>
                      <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الخطوات</th>
                      <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الخطوات المستهدفة</th>
                      <th className="text-right py-3 px-6 text-sm font-medium text-white/60">نسبة الإنجاز</th>
                      <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="border-b border-white/10 last:border-0">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#0AE7F2]/10 rounded-lg flex items-center justify-center">
                              <Footprints size={16} className="text-[#0AE7F2]" />
                            </div>
                            <span className="font-medium">{item.traineeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-sm">{formatDate(item.date, 'yyyy-MM-dd')}</span>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-sm">{item.steps.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-6">
                          {item.isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={item.targetSteps}
                                onChange={(e) => handleChangeTargetSteps(item.id, parseInt(e.target.value) || 3000)}
                                className="w-24 bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-lg p-1 text-white text-center focus:outline-none focus:border-[#0AE7F2]"
                                min="1000"
                                max="20000"
                                step="500"
                              />
                              <span className="text-sm text-gray-400">خطوة</span>
                            </div>
                          ) : (
                            <span className="text-sm">{item.targetSteps.toLocaleString()} خطوة</span>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getProgressColor(item.progress)} rounded-full`}
                                style={{ width: `${Math.min(100, item.progress)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getProgressTextColor(item.progress)}`}>
                              {item.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {item.isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveTargetSteps(item.id)}
                                  disabled={savingId === item.id}
                                  className="p-2 bg-[#0AE7F2]/10 hover:bg-[#0AE7F2]/20 rounded-lg transition-colors text-[#0AE7F2]"
                                >
                                  {savingId === item.id ? (
                                    <Loader2 size={16} className="animate-spin" />
                                  ) : (
                                    <Save size={16} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCancelEdit(item.id)}
                                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors text-rose-500"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleEditTargetSteps(item.id)}
                                className="p-2 bg-[#0AE7F2]/10 hover:bg-[#0AE7F2]/20 rounded-lg transition-colors text-[#0AE7F2]"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Summary Card */}
          {!loading && filteredData.length > 0 && (
            <div className="bg-[#1A1F2E] rounded-xl border border-white/10 p-6 mt-6">
              <h2 className="text-lg font-bold mb-4">ملخص الخطوات</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Footprints size={20} className="text-[#0AE7F2]" />
                    <h3 className="font-medium">إجمالي الخطوات</h3>
                  </div>
                  <p className="text-2xl font-bold text-[#0AE7F2]">
                    {filteredData.reduce((sum, item) => sum + item.steps, 0).toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target size={20} className="text-[#0AE7F2]" />
                    <h3 className="font-medium">متوسط الخطوات المستهدفة</h3>
                  </div>
                  <p className="text-2xl font-bold text-[#0AE7F2]">
                    {Math.round(filteredData.reduce((sum, item) => sum + item.targetSteps, 0) / filteredData.length).toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-[#0A0F1C]/40 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#0AE7F2] flex items-center justify-center">
                      <span className="text-black text-xs font-bold">%</span>
                    </div>
                    <h3 className="font-medium">متوسط نسبة الإنجاز</h3>
                  </div>
                  <p className="text-2xl font-bold text-[#0AE7F2]">
                    {Math.round(filteredData.reduce((sum, item) => sum + item.progress, 0) / filteredData.length)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}