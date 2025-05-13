import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Play, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChestExercisesProps {
  onBack: () => void;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
}

// Custom SVG icon for chest exercises
const ChestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v18" />
    <path d="M18 3v18" />
    <path d="M6 12h12" />
    <path d="M6 8h12" />
    <path d="M6 16h12" />
  </svg>
);

export function ChestExercises({ onBack }: ChestExercisesProps) {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);

  useEffect(() => {
    fetchChestExercises();
  }, []);

  const fetchChestExercises = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockExercises = [
        {
          id: '1',
          name: 'تمرين ضغط صدر علوي بالدمبل',
          sets: 3,
          reps: 12,
          description: 'تمرين لتقوية عضلات الصدر العلوية',
          videoUrl: 'https://player.vimeo.com/video/915685526',
          thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: '2',
          name: 'تمرين ضغط صدر مستوي بالدمبل',
          sets: 4,
          reps: 10,
          description: 'تمرين لتقوية عضلات الصدر الوسطى',
          videoUrl: 'https://player.vimeo.com/video/915685526',
          thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: '3',
          name: 'تمرين تجميع صدر بالجهاز',
          sets: 3,
          reps: 15,
          description: 'تمرين لتقوية عضلات الصدر الداخلية',
          videoUrl: 'https://player.vimeo.com/video/915685526',
          thumbnailUrl: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?q=80&w=1000&auto=format&fit=crop'
        }
      ];

      setExercises(mockExercises);
      setError(null);
    } catch (err) {
      console.error('Error fetching chest exercises:', err);
      setError('حدث خطأ أثناء تحميل التمارين');
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <button onClick={onBack} className="text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">تمارين الصدر</h1>
            <button className="text-white">
              <Share2 size={24} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن تمرين..."
                className="input-base w-full pr-12"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0AE7F2]" size={20} />
            </div>
          </div>
        </div>

        {/* Main Content - Full Screen */}
        <div className="flex-1 overflow-y-auto content-container">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#0AE7F2] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-rose-500/10 border border-rose-500 text-rose-500 p-4 rounded-xl text-center">
                {error}
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">لا توجد تمارين تطابق بحثك</p>
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  className="card-base"
                >
                  {/* Video Thumbnail - Full width */}
                  <div 
                    className="relative w-full h-48 mb-4 rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedVideo(exercise)}
                  >
                    <img 
                      src={exercise.thumbnailUrl} 
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={48} className="text-[#0AE7F2]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{exercise.name}</h3>
                    <button 
                      onClick={() => setSelectedVideo(exercise)}
                      className="text-[#0AE7F2] hover:bg-[#0AE7F2]/10 p-2 rounded-full transition-colors"
                    >
                      <Play size={20} />
                    </button>
                  </div>
                  {exercise.description && (
                    <p className="text-gray-400 text-sm mb-4">{exercise.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-[#0AE7F2]">
                    <span>{exercise.sets} مجموعات</span>
                    <span>{exercise.reps} تكرار</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Video Modal - Full Screen */}
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
                src={selectedVideo.videoUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-white mb-2">{selectedVideo.name}</h3>
              {selectedVideo.description && (
                <p className="text-gray-400">{selectedVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}