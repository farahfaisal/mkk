import React, { useState, useEffect } from 'react';
import { User, Settings, Calendar, BarChart2, Trash2, CheckCircle, XCircle, Clock, Plus, Search, Filter, Footprints, Target } from 'lucide-react';
import { EditTraineeModal } from './EditTraineeModal';
import { TraineePerformanceModal } from './TraineePerformanceModal';
import { TraineeScheduleModal } from './TraineeScheduleModal';
import { TraineeRegistration } from './TraineeRegistration';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../lib/utils/date';
import { TraineeStepsModal } from './TraineeStepsModal';

interface Trainee {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  fatPercentage?: number;
  muscleMass?: number;
  goals?: string[];
  currentWeight: number;
  initialWeight: number;
  currentFat: number;
  initialFat: number;
  currentMuscle: number;
  initialMuscle: number;
  currentWaist: number;
  initialWaist: number;
  currentNeck: number;
  initialNeck: number;
  currentArm: number;
  initialArm: number;
  targetSteps?: number;
}

export function AdminTraineesTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrainees();
  }, []);

  const fetchTrainees = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from('trainee_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get target steps for each trainee
        const traineeIds = data.map(trainee => trainee.id);
        const { data: stepsData, error: stepsError } = await supabase
          .from('trainee_steps')
          .select('trainee_id, target_steps')
          .in('trainee_id', traineeIds)
          .order('date', { ascending: false });

        if (stepsError) throw stepsError;

        // Create a map of trainee_id to target_steps
        const targetStepsMap = new Map();
        stepsData.forEach(step => {
          if (!targetStepsMap.has(step.trainee_id)) {
            targetStepsMap.set(step.trainee_id, step.target_steps);
          }
        });

        const formattedTrainees = data.map(trainee => ({
          id: trainee.id,
          name: trainee.name,
          email: trainee.email,
          phone: trainee.phone || '',
          plan: trainee.subscription_plan,
          status: trainee.status as 'active' | 'pending' | 'inactive',
          joinDate: formatDate(new Date(trainee.created_at), 'yyyy-MM-dd'),
          height: trainee.height || 0,
          weight: trainee.current_weight || 0,
          targetWeight: trainee.target_weight || 0,
          fatPercentage: trainee.fat_percentage || 0,
          muscleMass: trainee.muscle_mass || 0,
          goals: trainee.goal || [],
          currentWeight: trainee.current_weight || 0,
          initialWeight: trainee.initial_weight || 0,
          currentFat: trainee.fat_percentage || 0,
          initialFat: trainee.fat_percentage || 0, // Assuming no historical data
          currentMuscle: trainee.muscle_mass || 0,
          initialMuscle: trainee.muscle_mass || 0, // Assuming no historical data
          currentWaist: 0, // Not in the schema
          initialWaist: 0, // Not in the schema
          currentNeck: 0, // Not in the schema
          initialNeck: 0, // Not in the schema
          currentArm: 0, // Not in the schema
          initialArm: 0, // Not in the schema
          targetSteps: targetStepsMap.get(trainee.id) || 3000
        }));

        setTrainees(formattedTrainees);
      } else {
        // Use localStorage for development
        const storedTrainees = localStorage.getItem('trainees');
        if (storedTrainees) {
          setTrainees(JSON.parse(storedTrainees));
        } else {
          // Use mock data if localStorage is empty
          const mockTrainees = [
            { id: uuidv4(), name: 'أحمد محمد', email: 'ahmed@example.com', phone: '970 59 123 4567', plan: 'premium', status: 'active', joinDate: '2024-03-15', currentWeight: 80, initialWeight: 85, currentFat: 18, initialFat: 22, currentMuscle: 45, initialMuscle: 40, currentWaist: 85, initialWaist: 90, currentNeck: 38, initialNeck: 40, currentArm: 32, initialArm: 30, targetSteps: 3000 },
            { id: uuidv4(), name: 'سارة علي', email: 'sara@example.com', phone: '970 59 987 6543', plan: 'basic', status: 'pending', joinDate: '2024-03-14', currentWeight: 65, initialWeight: 70, currentFat: 22, initialFat: 25, currentMuscle: 35, initialMuscle: 30, currentWaist: 70, initialWaist: 75, currentNeck: 32, initialNeck: 33, currentArm: 25, initialArm: 24, targetSteps: 5000 },
            { id: uuidv4(), name: 'محمد خالد', email: 'mohamed@example.com', phone: '970 59 456 7890', plan: 'pro', status: 'inactive', joinDate: '2024-03-13', currentWeight: 90, initialWeight: 95, currentFat: 20, initialFat: 24, currentMuscle: 50, initialMuscle: 45, currentWaist: 95, initialWaist: 100, currentNeck: 42, initialNeck: 44, currentArm: 36, initialArm: 34, targetSteps: 4000 }
          ];
          setTrainees(mockTrainees);
          localStorage.setItem('trainees', JSON.stringify(mockTrainees));
        }
      }
    } catch (err) {
      console.error('Error fetching trainees:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المتدربين');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (traineeId: string) => {
    const trainee = trainees.find(t => t.id === traineeId);
    if (trainee) {
      setSelectedTrainee(trainee);
      setShowEditForm(true);
    }
  };

  const handleSaveEdit = async (traineeId: string, data: any) => {
    try {
      setLoading(true);
      
      if (isSupabaseConnected()) {
        const { error } = await supabase
          .from('trainee_profiles')
          .update({
            name: data.name,
            email: data.email,
            phone: data.phone,
            subscription_plan: data.plan,
            height: data.height,
            current_weight: data.currentWeight,
            initial_weight: data.initialWeight,
            target_weight: data.targetWeight,
            fat_percentage: data.currentFat,
            muscle_mass: data.currentMuscle,
            goal: data.goals,
            status: data.status
          })
          .eq('id', traineeId);

        if (error) throw error;
      } else {
        // Update in localStorage
        const storedTrainees = JSON.parse(localStorage.getItem('trainees') || '[]');
        const updatedTrainees = storedTrainees.map((trainee: any) => 
          trainee.id === traineeId ? { ...trainee, ...data } : trainee
        );
        localStorage.setItem('trainees', JSON.stringify(updatedTrainees));
      }
      
      setTrainees(prev => prev.map(trainee => 
        trainee.id === traineeId ? { ...trainee, ...data } : trainee
      ));
      
      setShowEditForm(false);
      setSelectedTrainee(null);
    } catch (err) {
      console.error('Error updating trainee:', err);
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث المتدرب');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (traineeId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المتدرب؟')) {
      try {
        setLoading(true);
        
        if (isSupabaseConnected()) {
          const { error } = await supabase
            .from('trainee_profiles')
            .delete()
            .eq('id', traineeId);

          if (error) throw error;
        } else {
          // Delete from localStorage
          const storedTrainees = JSON.parse(localStorage.getItem('trainees') || '[]');
          const updatedTrainees = storedTrainees.filter((trainee: any) => trainee.id !== traineeId);
          localStorage.setItem('trainees', JSON.stringify(updatedTrainees));
        }
        
        setTrainees(prev => prev.filter(trainee => trainee.id !== traineeId));
      } catch (err) {
        console.error('Error deleting trainee:', err);
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء حذف المتدرب');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewPerformance = (traineeId: string) => {
    const trainee = trainees.find(t => t.id === traineeId);
    if (trainee) {
      setSelectedTrainee(trainee);
      setShowPerformanceModal(true);
    }
  };

  const handleViewSteps = (traineeId: string) => {
    const trainee = trainees.find(t => t.id === traineeId);
    if (trainee) {
      setSelectedTrainee(trainee);
      setShowStepsModal(true);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowAddForm(false);
    // Refresh trainees list
    fetchTrainees();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'pending':
        return 'text-amber-500 bg-amber-500/10';
      case 'inactive':
        return 'text-rose-500 bg-rose-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'pending':
        return 'معلق';
      case 'inactive':
        return 'غير نشط';
      default:
        return status;
    }
  };

  const filteredTrainees = trainees.filter(trainee =>
    trainee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trainee.phone.includes(searchQuery)
  );

  return (
    <div className="bg-[#1A1F2E] rounded-xl border border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">المتدربين</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Filter size={16} className="text-white/60" />
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#0AE7F2] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>إضافة متدرب</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث عن متدرب..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#0AE7F2]/50 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">المتدرب</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">البريد الإلكتروني</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">رقم الهاتف</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الخطة</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الحالة</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الوزن الحالي</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الخطوات المستهدفة</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">تاريخ الانضمام</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl">
                    {error}
                    <button 
                      onClick={fetchTrainees}
                      className="underline hover:no-underline mt-2 block w-full"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredTrainees.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  لا توجد متدربين
                </td>
              </tr>
            ) : (
              filteredTrainees.map((trainee) => (
                <tr key={trainee.id} className="border-b border-white/10 last:border-0">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0AE7F2]/10 rounded-lg flex items-center justify-center">
                        <User size={16} className="text-[#0AE7F2]" />
                      </div>
                      <span className="font-medium">{trainee.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{trainee.email}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{trainee.phone}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">
                      {trainee.plan === 'basic' ? 'الخطة الأساسية' : 
                       trainee.plan === 'premium' ? 'الخطة المتقدمة' : 
                       trainee.plan === 'pro' ? 'الخطة الاحترافية' : trainee.plan}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trainee.status)}`}>
                      {getStatusIcon(trainee.status)}
                      <span>{getStatusText(trainee.status)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{trainee.currentWeight} كجم</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{trainee.targetSteps} خطوة</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{trainee.joinDate}</span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(trainee.id)}
                        className="p-2 hover:bg-[#0AE7F2]/10 rounded-full transition-colors text-[#0AE7F2]"
                        title="تعديل البيانات"
                      >
                        <Settings size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedTrainee(trainee);
                          setShowScheduleModal(true);
                        }}
                        className="p-2 hover:bg-[#0AE7F2]/10 rounded-full transition-colors text-[#0AE7F2]"
                        title="تعيين جدول"
                      >
                        <Calendar size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewPerformance(trainee.id)}
                        className="p-2 hover:bg-[#0AE7F2]/10 rounded-full transition-colors text-[#0AE7F2]"
                        title="عرض الأداء"
                      >
                        <BarChart2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleViewSteps(trainee.id)}
                        className="p-2 hover:bg-[#0AE7F2]/10 rounded-full transition-colors text-[#0AE7F2]"
                        title="إدارة الخطوات"
                      >
                        <Footprints size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(trainee.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-full transition-colors text-rose-500"
                        title="حذف المتدرب"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Trainee Modal */}
      {showAddForm && (
        <TraineeRegistration
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditForm && selectedTrainee && (
        <EditTraineeModal
          trainee={selectedTrainee}
          onClose={() => {
            setShowEditForm(false);
            setSelectedTrainee(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Performance Modal */}
      {showPerformanceModal && selectedTrainee && (
        <TraineePerformanceModal
          traineeId={selectedTrainee.id}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedTrainee(null);
          }}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedTrainee && (
        <TraineeScheduleModal
          traineeId={selectedTrainee.id}
          traineeName={selectedTrainee.name}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedTrainee(null);
          }}
        />
      )}

      {/* Steps Modal */}
      {showStepsModal && selectedTrainee && (
        <TraineeStepsModal
          trainee={selectedTrainee}
          onClose={() => {
            setShowStepsModal(false);
            setSelectedTrainee(null);
          }}
          onSave={(updatedTrainee) => {
            setTrainees(prev => prev.map(t => 
              t.id === updatedTrainee.id ? { ...t, targetSteps: updatedTrainee.targetSteps } : t
            ));
            setShowStepsModal(false);
            setSelectedTrainee(null);
          }}
        />
      )}
    </div>
  );
}