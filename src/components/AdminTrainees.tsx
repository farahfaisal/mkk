import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, CheckCircle, XCircle, Clock, User, Settings, BarChart2, Calendar } from 'lucide-react';
import { EditTraineeModal } from './EditTraineeModal';
import { TraineePerformanceModal } from './TraineePerformanceModal';
import { TraineeScheduleModal } from './TraineeScheduleModal';
import { TraineeRegistration } from './TraineeRegistration';
import { getMockData } from '../lib/storage';

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
}

export function AdminTrainees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load mock data
    const { trainees: mockTrainees } = getMockData();
    setTrainees(mockTrainees);
  }, []);

  const handleEdit = (traineeId: string) => {
    const trainee = trainees.find(t => t.id === traineeId);
    if (trainee) {
      setSelectedTrainee(trainee);
      setShowEditForm(true);
    }
  };

  const handleSaveEdit = (traineeId: string, data: any) => {
    setTrainees(prev => prev.map(trainee => 
      trainee.id === traineeId ? { ...trainee, ...data } : trainee
    ));
    setShowEditForm(false);
    setSelectedTrainee(null);
  };

  const handleDelete = (traineeId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المتدرب؟')) {
      setTrainees(prev => prev.filter(trainee => trainee.id !== traineeId));
    }
  };

  const handleViewPerformance = (traineeId: string) => {
    const trainee = trainees.find(t => t.id === traineeId);
    if (trainee) {
      setSelectedTrainee(trainee);
      setShowPerformanceModal(true);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowAddForm(false);
    // Refresh trainees list
    const { trainees: mockTrainees } = getMockData();
    setTrainees(mockTrainees);
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
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">تاريخ الانضمام</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTrainees.map((trainee) => (
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
                  <span className="text-sm">{trainee.plan}</span>
                </td>
                <td className="py-3 px-6">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trainee.status)}`}>
                    {getStatusIcon(trainee.status)}
                    <span>{getStatusText(trainee.status)}</span>
                  </div>
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
                      onClick={() => handleDelete(trainee.id)}
                      className="p-2 hover:bg-rose-500/10 rounded-full transition-colors text-rose-500"
                      title="حذف المتدرب"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
    </div>
  );
}