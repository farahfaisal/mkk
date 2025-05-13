import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, CheckCircle, XCircle, Clock, Dumbbell, Video, Link } from 'lucide-react';
import { supabase, isSupabaseConnected } from '../lib/supabase';

interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: number;
  status: 'active' | 'pending' | 'inactive';
  videoUrl?: string;
}

interface ExerciseFormData {
  name: string;
  category: string;
  sets: number;
  reps: number;
  description?: string;
  videoFile?: File;
  videoUrl?: string;
}

export function AdminExercises() {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: '',
    category: 'chest',
    sets: 3,
    reps: 12
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInputType, setVideoInputType] = useState<'file' | 'url'>('file');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setExercises(data || []);
      } else {
        // Mock data for development
        setExercises([
          {
            id: '1',
            name: 'بنش بريس',
            category: 'chest',
            sets: 4,
            reps: 12,
            status: 'active'
          },
          {
            id: '2',
            name: 'سكوات',
            category: 'legs',
            sets: 3,
            reps: 15,
            status: 'active'
          },
          {
            id: '3',
            name: 'ديدليفت',
            category: 'back',
            sets: 4,
            reps: 10,
            status: 'active'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل التمارين');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (file: File): Promise<string> => {
    if (!isSupabaseConnected()) {
      throw new Error('Database connection not available');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `exercise-videos/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        contentType: 'video/mp4',
        upsert: true,
        onUploadProgress: (progress) => {
          setUploadProgress((progress.loaded / progress.total) * 100);
        }
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleAddExercise = async () => {
    try {
      setLoading(true);
      setError(null);

      let videoUrl = formData.videoUrl || '';
      if (videoInputType === 'file' && formData.videoFile) {
        videoUrl = await handleVideoUpload(formData.videoFile);
      }

      if (isSupabaseConnected()) {
        const { data, error } = await supabase
          .from('exercises')
          .insert([{
            name: formData.name,
            category: formData.category,
            sets: formData.sets,
            reps: formData.reps,
            description: formData.description,
            video_url: videoUrl,
            status: 'active'
          }])
          .select()
          .single();

        if (error) throw error;
        
        setExercises(prev => [data, ...prev]);
      } else {
        // Mock add for development
        const newExercise = {
          id: Date.now().toString(),
          name: formData.name,
          category: formData.category,
          sets: formData.sets,
          reps: formData.reps,
          status: 'active',
          videoUrl
        };
        
        setExercises(prev => [newExercise, ...prev]);
      }
      
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Error adding exercise:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة التمرين');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'chest',
      sets: 3,
      reps: 12
    });
    setError(null);
    setVideoInputType('file');
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

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#1A1F2E] rounded-xl border border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">التمارين</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Filter size={16} className="text-white/60" />
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#0AE7F2] text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0AE7F2]/90 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              <span>إضافة تمرين</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث عن تمرين..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 pr-10 text-white placeholder-white/40 focus:outline-none focus:border-[#0AE7F2]/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">التمرين</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الفئة</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">المجموعات</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">التكرارات</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60">الحالة</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-white/60"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : filteredExercises.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  لا توجد تمارين
                </td>
              </tr>
            ) : (
              filteredExercises.map((exercise) => (
                <tr key={exercise.id} className="border-b border-white/10 last:border-0">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0AE7F2]/10 rounded-lg flex items-center justify-center">
                        <Dumbbell size={16} className="text-[#0AE7F2]" />
                      </div>
                      <span className="font-medium">{exercise.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{exercise.category}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{exercise.sets}</span>
                  </td>
                  <td className="py-3 px-6">
                    <span className="text-sm">{exercise.reps}</span>
                  </td>
                  <td className="py-3 px-6">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exercise.status)}`}>
                      {getStatusIcon(exercise.status)}
                      <span>
                        {exercise.status === 'active' ? 'نشط' : 
                         exercise.status === 'pending' ? 'معلق' : 'غير نشط'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:bg-white/5 rounded transition-colors">
                        <Edit2 size={16} className="text-white/60" />
                      </button>
                      <button className="p-1 hover:bg-white/5 rounded transition-colors">
                        <Trash2 size={16} className="text-white/60" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1F2E] rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-[#0AE7F2]/20">
              <h2 className="text-xl font-bold">إضافة تمرين جديد</h2>
            </div>
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddExercise();
              }} className="space-y-4">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-1">اسم التمرين</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">الفئة</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                    required
                  >
                    <option value="chest">الصدر</option>
                    <option value="back">الظهر</option>
                    <option value="legs">الأرجل</option>
                    <option value="shoulders">الأكتاف</option>
                    <option value="arms">الذراعين</option>
                    <option value="abs">البطن</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">المجموعات</label>
                    <input
                      type="number"
                      value={formData.sets}
                      onChange={(e) => setFormData({ ...formData, sets: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">التكرارات</label>
                    <input
                      type="number"
                      value={formData.reps}
                      onChange={(e) => setFormData({ ...formData, reps: Number(e.target.value) })}
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">الوصف (اختياري)</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2] h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">فيديو التمرين</label>
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setVideoInputType('file')}
                      className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                        videoInputType === 'file'
                          ? 'bg-[#0AE7F2] text-black'
                          : 'bg-[#0A0F1C] text-gray-400'
                      }`}
                    >
                      <Video size={20} />
                      <span>رفع ملف</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputType('url')}
                      className={`flex-1 py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                        videoInputType === 'url'
                          ? 'bg-[#0AE7F2] text-black'
                          : 'bg-[#0A0F1C] text-gray-400'
                      }`}
                    >
                      <Link size={20} />
                      <span>رابط</span>
                    </button>
                  </div>

                  {videoInputType === 'file' ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/mp4"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({ ...formData, videoFile: file, videoUrl: undefined });
                          }
                        }}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0A0F1C]/80 transition-colors"
                      >
                        <Video size={20} className="text-[#0AE7F2]" />
                        <span>{formData.videoFile ? formData.videoFile.name : 'اختر ملف فيديو'}</span>
                      </label>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2">
                          <div className="h-2 bg-[#0A0F1C] rounded-full">
                            <div 
                              className="h-full bg-[#0AE7F2] rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-400 mt-1 text-center">{Math.round(uploadProgress)}%</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={formData.videoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value, videoFile: undefined })}
                      placeholder="أدخل رابط الفيديو"
                      className="w-full bg-[#0A0F1C] border border-[#0AE7F2]/20 rounded-xl p-3 text-white focus:outline-none focus:border-[#0AE7F2]"
                    />
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 rounded-xl border border-[#0AE7F2] text-[#0AE7F2] hover:bg-[#0AE7F2]/10 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl bg-[#0AE7F2] text-black hover:bg-[#0AE7F2]/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'جاري الإضافة...' : 'إضافة التمرين'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}