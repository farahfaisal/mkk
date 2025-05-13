import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Play, 
  Plus, 
  ChevronRight, 
  Activity, 
  Timer,
  CheckCircle,
  XCircle,
  Check,
  X,
  Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { updateDailyPerformance } from '../lib/api/performance';

interface MyExercisesProps {
  onBack: () => void;
}

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  duration?: string;
  type: 'strength' | 'cardio';
  status: 'pending' | 'completed' | 'skipped';
  description?: string;
  videoUrl?: string;
}

interface WorkoutProgram {
  id: number;
  name: string;
  exercises: Exercise[];
  lastPerformed?: string;
  progress: number;
}

// Custom SVG icons for body parts
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16" />
    <path d="M18 4v16" />
    <path d="M6 12h12" />
    <path d="M8 8l4 4 4-4" />
    <path d="M16 16l-4-4-4 4" />
  </svg>
);

const ChestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v18" />
    <path d="M18 3v18" />
    <path d="M6 12h12" />
    <path d="M6 8h12" />
    <path d="M6 16h12" />
  </svg>
);

const ShoulderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4C7.5 4 4 7.5 4 12" />
    <path d="M20 12c0-4.5-3.5-8-8-8" />
    <path d="M12 8c-2.2 0-4 1.8-4 4" />
    <path d="M16 12c0-2.2-1.8-4-4-4" />
  </svg>
);

const BicepIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4c0 0 2-2 5-2s5 2 5 2" />
    <path d="M12 2v20" />
    <path d="M7 20c0 0 2 2 5 2s5-2 5-2" />
    <path d="M7 16c0 0 2-2 5-2s5 2 5 2" />
  </svg>
);

const TricepIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 4c0 0-2-2-5-2s-5 2-5 2" />
    <path d="M12 2v20" />
    <path d="M17 20c0 0-2 2-5 2s-5-2-5-2" />
    <path d="M17 16c0 0-2-2-5-2s-5 2-5 2" />
  </svg>
);

const AbsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <line x1="6" y1="8" x2="18" y2="8" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="6" y1="16" x2="18" y2="16" />
  </svg>
);

const CardioIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
    <path d="M12 8l0 4l2 2" />
    <path d="M17.5 17.5l-2.5 -2.5" />
    <path d="M3 12h2" />
    <path d="M19 12h2" />
  </svg>
);

export function MyExercises({ onBack }: MyExercisesProps) {
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>([]);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{url: string, name: string} | null>(null);

  useEffect(() => {
    fetchWorkoutPrograms();
  }, []);

  useEffect(() => {
    // حساب إجمالي التمارين المكتملة
    const totalCompleted = workoutPrograms.reduce((sum, program) => {
      return sum + program.exercises.filter(e => e.status === 'completed').length;
    }, 0);
    
    setCompletedExercises(totalCompleted);
    
    // تحديث الأداء في قاعدة البيانات
    updatePerformance(totalCompleted);
  }, [workoutPrograms]);

  const fetchWorkoutPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isSupabaseConnected()) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('المستخدم غير مسجل الدخول');
        }

        // Get the start of the current week (Sunday)
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const weekStartDate = startOfWeek.toISOString().split('T')[0];

        // Get weekly schedule
        const { data: schedule, error: scheduleError } = await supabase
          .from('weekly_schedules')
          .select('id')
          .eq('trainee_id', user.id)
          .eq('week_start_date', weekStartDate)
          .single();

        if (scheduleError && scheduleError.code !== 'PGRST116') {
          throw scheduleError;
        }

        if (!schedule) {
          // No schedule found, use mock data
          setWorkoutPrograms(getMockWorkoutPrograms());
          return;
        }

        // Get exercises for the schedule
        const { data: scheduleExercises, error: exercisesError } = await supabase
          .from('schedule_exercises')
          .select(`
            id,
            exercise_id,
            day_of_week,
            sets,
            reps,
            status,
            completed_at,
            exercises (
              name,
              category,
              description,
              video_url
            )
          `)
          .eq('schedule_id', schedule.id)
          .order('day_of_week', { ascending: true });

        if (exercisesError) throw exercisesError;

        // Group exercises by day
        const exercisesByDay = scheduleExercises.reduce((acc: Record<number, any[]>, exercise) => {
          const day = exercise.day_of_week;
          if (!acc[day]) acc[day] = [];
          acc[day].push(exercise);
          return acc;
        }, {});

        // Create workout programs for each day
        const programs: WorkoutProgram[] = [];
        
        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        
        for (const [day, exercises] of Object.entries(exercisesByDay)) {
          const dayIndex = parseInt(day);
          const dayName = dayNames[dayIndex];
          
          const formattedExercises = exercises.map(ex => ({
            id: ex.id,
            name: ex.exercises.name,
            sets: ex.sets,
            reps: ex.reps,
            type: ex.exercises.category.includes('cardio') ? 'cardio' : 'strength',
            status: ex.status,
            description: ex.exercises.description,
            videoUrl: ex.exercises.video_url
          }));
          
          const completedCount = formattedExercises.filter(e => e.status === 'completed').length;
          const progress = formattedExercises.length > 0 
            ? Math.round((completedCount / formattedExercises.length) * 100) 
            : 0;
          
          programs.push({
            id: dayIndex,
            name: `تمارين ${dayName}`,
            exercises: formattedExercises,
            lastPerformed: dayIndex === today.getDay() ? 'اليوم' : dayNames[dayIndex],
            progress
          });
        }
        
        setWorkoutPrograms(programs.length > 0 ? programs : getMockWorkoutPrograms());
      } else {
        // Use mock data for development
        setWorkoutPrograms(getMockWorkoutPrograms());
      }
    } catch (err) {
      console.error('Error fetching workout programs:', err);
      setError('حدث خطأ أثناء تحميل برامج التمارين');
      setWorkoutPrograms(getMockWorkoutPrograms());
    } finally {
      setLoading(false);
    }
  };

  const getMockWorkoutPrograms = (): WorkoutProgram[] => {
    return [
      {
        id: 1,
        name: 'تمارين الصدر والكتف',
        lastPerformed: 'اليوم',
        progress: 0,
        exercises: [
          { id: 1, name: 'بنش بريس', sets: 4, reps: 12, type: 'strength', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' },
          { id: 2, name: 'دمبل بريس', sets: 3, reps: 15, type: 'strength', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' },
          { id: 3, name: 'بوش اب', sets: 3, reps: 20, type: 'strength', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' }
        ]
      },
      {
        id: 2,
        name: 'تمارين الظهر',
        lastPerformed: 'منذ يومين',
        progress: 0,
        exercises: [
          { id: 4, name: 'بول اب', sets: 4, reps: 10, type: 'strength', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' },
          { id: 5, name: 'ديدليفت', sets: 3, reps: 12, type: 'strength', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' },
          { id: 6, name: 'بنت اوفر رو', sets: 3, reps: 15, type: 'strength', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' }
        ]
      },
      {
        id: 3,
        name: 'تمارين الكارديو',
        lastPerformed: 'منذ 3 أيام',
        progress: 0,
        exercises: [
          { id: 7, name: 'جري', sets: 1, reps: 1, duration: '20 دقيقة', type: 'cardio', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' },
          { id: 8, name: 'دراجة ثابتة', sets: 1, reps: 1, duration: '15 دقيقة', type: 'cardio', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' },
          { id: 9, name: 'حبل القفز', sets: 3, reps: 1, duration: '5 دقائق', type: 'cardio', status: 'pending', videoUrl: 'https://player.vimeo.com/video/915685526' }
        ]
      }
    ];
  };

  const updatePerformance = async (completedExercisesCount: number) => {
    try {
      if (isSupabaseConnected()) {
        // الحصول على عدد الوجبات المكتملة (افتراضي 0)
        const { data } = await supabase
          .from('trainee_performance')
          .select('completed_meals')
          .eq('date', new Date().toISOString().split('T')[0])
          .single();
        
        const completedMeals = data?.completed_meals || 0;
        
        // تحديث الأداء
        await updateDailyPerformance(completedExercisesCount, completedMeals);
      }
    } catch (error) {
      console.error('Error updating performance:', error);
    }
  };

  const handleExerciseStatus = async (programId: number, exerciseId: number, status: 'completed' | 'skipped') => {
    // Update the workout programs state with the new exercise status
    const updatedPrograms = workoutPrograms.map(program => {
      if (program.id === programId) {
        // Update the exercises in this program
        const updatedExercises = program.exercises.map(exercise =>
          exercise.id === exerciseId ? { ...exercise, status } : exercise
        );
        
        // Calculate new progress
        const completedCount = updatedExercises.filter(e => e.status === 'completed').length;
        const totalExercises = updatedExercises.length;
        const newProgress = Math.round((completedCount / totalExercises) * 100);
        
        // Return updated program with new progress
        return {
          ...program,
          exercises: updatedExercises,
          progress: newProgress
        };
      }
      return program;
    });
    
    // Update state with the new programs array
    setWorkoutPrograms(updatedPrograms);
    
    // If we're connected to Supabase, update the database
    if (isSupabaseConnected()) {
      try {
        const { error } = await supabase
          .from('schedule_exercises')
          .update({
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null
          })
          .eq('id', exerciseId);
          
        if (error) throw error;
      } catch (err) {
        console.error('Error updating exercise status:', err);
        // Revert the state change if the update fails
        setWorkoutPrograms(workoutPrograms);
      }
    }
    
    // If we're viewing a specific program, update the selected program as well
    if (selectedProgram && selectedProgram.id === programId) {
      const updatedProgram = updatedPrograms.find(p => p.id === programId);
      if (updatedProgram) {
        setSelectedProgram(updatedProgram);
      }
    }
  };

  const handleWatchVideo = (videoUrl: string | undefined, exerciseName: string) => {
    if (videoUrl) {
      setSelectedVideo({ url: videoUrl, name: exerciseName });
    } else {
      alert('لا يوجد فيديو متاح لهذا التمرين');
    }
  };

  const renderExerciseIcon = (type: 'strength' | 'cardio', name: string) => {
    if (type === 'cardio') {
      return <CardioIcon />;
    }
    
    // Based on exercise name, determine the appropriate icon
    if (name.includes('صدر') || name.includes('بنش') || name.includes('بوش')) {
      return <ChestIcon />;
    } else if (name.includes('ظهر') || name.includes('بول') || name.includes('ديدليفت')) {
      return <BackIcon />;
    } else if (name.includes('كتف') || name.includes('شولدر')) {
      return <ShoulderIcon />;
    } else if (name.includes('بايسبس') || name.includes('يد أمامية')) {
      return <BicepIcon />;
    } else if (name.includes('ترايسبس') || name.includes('يد خلفية')) {
      return <TricepIcon />;
    } else if (name.includes('بطن') || name.includes('كرانش')) {
      return <AbsIcon />;
    }
    
    // Default icon
    return <Activity size={20} className="text-[#0AE7F2]" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'skipped':
        return 'text-rose-500 bg-rose-500/10';
      default:
        return 'text-amber-500 bg-amber-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'skipped':
        return <XCircle size={16} className="text-rose-500" />;
      default:
        return <Timer size={16} className="text-amber-500" />;
    }
  };

  const handleBack = () => {
    if (selectedProgram) {
      setSelectedProgram(null);
    } else {
      onBack();
    }
  };

  const renderProgramList = () => (
    <div className="content-container space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
          {error}
          <button 
            onClick={fetchWorkoutPrograms}
            className="underline hover:no-underline mt-2 block w-full"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : workoutPrograms.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-[#0AE7F2]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={32} className="text-[#0AE7F2]" />
          </div>
          <h3 className="text-lg font-bold mb-2">لا توجد تمارين</h3>
          <p className="text-gray-400">لم يتم تعيين أي تمارين لك بعد</p>
        </div>
      ) : (
        workoutPrograms.map((program) => (
          <button
            key={program.id}
            onClick={() => setSelectedProgram(program)}
            className="w-full card-base hover:bg-[#1A1F2E]/80 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <ChevronRight size={20} className="text-[#0AE7F2] opacity-0 group-hover:opacity-100 transition-opacity" />
              <h2 className="text-lg font-bold text-[#0AE7F2]">{program.name}</h2>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{program.exercises.length} تمارين</span>
                <span className="text-[#0AE7F2]">{Math.round(program.progress)}%</span>
              </div>
              <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0AE7F2] rounded-full transition-all duration-300"
                  style={{ width: `${program.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">آخر تمرين</span>
              <span className="text-[#0AE7F2]">{program.lastPerformed}</span>
            </div>
          </button>
        ))
      )}
    </div>
  );

  const renderProgramDetails = () => (
    <div className="content-container">
      <div className="card-base">
        <h2 className="text-xl font-bold text-[#0AE7F2] mb-6">{selectedProgram?.name}</h2>
        
        {/* Progress Summary */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">تقدم البرنامج</span>
            <span className="text-[#0AE7F2]">{Math.round(selectedProgram?.progress || 0)}%</span>
          </div>
          <div className="h-2 bg-[#0A0F1C] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0AE7F2] rounded-full transition-all duration-300"
              style={{ width: `${selectedProgram?.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {selectedProgram?.exercises.map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between p-4 bg-[#1A1F2E]/40 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="text-[#0AE7F2]">
                  {renderExerciseIcon(exercise.type, exercise.name)}
                </div>
                <div>
                  <h3 className="font-medium mb-1">{exercise.name}</h3>
                  <p className="text-sm text-gray-400">
                    {exercise.duration ? (
                      <span className="flex items-center gap-1">
                        <Timer size={14} />
                        {exercise.duration}
                      </span>
                    ) : (
                      `${exercise.sets} مجموعات × ${exercise.reps} تكرار`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {exercise.videoUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWatchVideo(exercise.videoUrl, exercise.name);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-[#0AE7F2]/20 text-[#0AE7F2] hover:bg-[#0AE7F2]/30"
                    title="شاهد فيديو التمرين"
                  >
                    <Video size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleExerciseStatus(selectedProgram.id, exercise.id, 'completed')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    exercise.status === 'completed' 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : 'hover:bg-emerald-500/10 text-gray-400'
                  }`}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleExerciseStatus(selectedProgram.id, exercise.id, 'skipped')}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    exercise.status === 'skipped' 
                      ? 'bg-rose-500/20 text-rose-500' 
                      : 'hover:bg-rose-500/10 text-gray-400'
                  }`}
                >
                  <X size={16} />
                </button>
                <div className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(exercise.status)}`}>
                  {getStatusIcon(exercise.status)}
                  <span>
                    {exercise.status === 'completed' ? 'مكتمل' :
                     exercise.status === 'skipped' ? 'متخطى' : 'معلق'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0A0F1C] text-white">
      {/* Background */}
      <div className="bg-base">
        <div className="bg-overlay">
          <div className="bg-pattern" />
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="header-base">
          <div className="flex justify-between items-center">
            <button 
              onClick={handleBack}
              className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]"
            >
              <ArrowLeft size={20} className="text-[#0AE7F2]" />
            </button>
            <h1 className="text-xl font-bold">قائمة تماريني</h1>
            <button className="w-10 h-10 bg-[#1A1F2E]/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-[#1A1F2E]/80 transition-colors border border-[#0AE7F2]">
              <Share2 size={20} className="text-[#0AE7F2]" />
            </button>
          </div>
        </div>

        {/* Main Content - Full Screen */}
        <div className="flex-1 overflow-y-auto">
          {selectedProgram ? renderProgramDetails() : renderProgramList()}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-[#0AE7F2] transition-colors"
            >
              <X size={24} />
            </button>
            <div className="relative pt-[56.25%] rounded-xl overflow-hidden">
              <iframe
                src={selectedVideo.url}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white mb-2">{selectedVideo.name}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}