import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Play, 
  Search, 
  X,
  Heart,
  Activity,
  Dumbbell,
  Footprints,
  CircleDot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AllExercisesProps {
  onBack: () => void;
  onChestClick: () => void;
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

// Custom SVG icons for body parts
const BackIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16" />
    <path d="M18 4v16" />
    <path d="M6 12h12" />
    <path d="M8 8l4 4 4-4" />
    <path d="M16 16l-4-4-4 4" />
  </svg>
);

const ChestIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v18" />
    <path d="M18 3v18" />
    <path d="M6 12h12" />
    <path d="M6 8h12" />
    <path d="M6 16h12" />
  </svg>
);

const ShoulderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4C7.5 4 4 7.5 4 12" />
    <path d="M20 12c0-4.5-3.5-8-8-8" />
    <path d="M12 8c-2.2 0-4 1.8-4 4" />
    <path d="M16 12c0-2.2-1.8-4-4-4" />
  </svg>
);

const BicepIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4c0 0 2-2 5-2s5 2 5 2" />
    <path d="M12 2v20" />
    <path d="M7 20c0 0 2 2 5 2s5-2 5-2" />
    <path d="M7 16c0 0 2-2 5-2s5 2 5 2" />
  </svg>
);

const TricepIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 4c0 0-2-2-5-2s-5 2-5 2" />
    <path d="M12 2v20" />
    <path d="M17 20c0 0-2 2-5 2s-5-2-5-2" />
    <path d="M17 16c0 0-2-2-5-2s-5 2-5 2" />
  </svg>
);

const AbsIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <line x1="6" y1="8" x2="18" y2="8" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="6" y1="16" x2="18" y2="16" />
  </svg>
);

const CardioIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
    <path d="M12 8l0 4l2 2" />
    <path d="M17.5 17.5l-2.5 -2.5" />
    <path d="M3 12h2" />
    <path d="M19 12h2" />
  </svg>
);

const exerciseCategories = [
  { id: 'cardio', name: 'أيروبي', icon: CardioIcon },
  { id: 'back', name: 'ظهر', icon: BackIcon },
  { id: 'chest', name: 'صدر', icon: ChestIcon },
  { id: 'shoulders', name: 'أكتاف', icon: ShoulderIcon },
  { id: 'legs', name: 'أرجل', icon: Footprints },
  { id: 'abs', name: 'بطن', icon: AbsIcon },
  { id: 'biceps', name: 'يد أمامية', icon: BicepIcon },
  { id: 'triceps', name: 'يد خلفية', icon: TricepIcon },
];

export function AllExercises({ onBack, onChestClick }: AllExercisesProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Exercise | null>(null);

  const handleCategoryClick = (category: { id: string; name: string }) => {
    if (category.id === 'chest') {
      onChestClick();
      return;
    }
    setSelectedCategory(category.id);
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setExercises([
        {
          id: '1',
          name: `تمرين ${category.name} 1`,
          sets: 3,
          reps: 12,
          description: `وصف تمرين ${category.name}`,
          videoUrl: 'https://player.vimeo.com/video/915685526',
          thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: '2',
          name: `تمرين ${category.name} 2`,
          sets: 4,
          reps: 10,
          description: `وصف تمرين ${category.name}`,
          videoUrl: 'https://player.vimeo.com/video/915685526',
          thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: '3',
          name: `تمرين ${category.name} 3`,
          sets: 3,
          reps: 15,
          description: `وصف تمرين ${category.name}`,
          videoUrl: 'https://player.vimeo.com/video/915685526',
          thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop'
        }
      ]);
      setLoading(false);
    }, 500);
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
            <h1 className="text-lg font-bold">كل التمارين</h1>
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
          {/* Exercise Categories Grid */}
          {!selectedCategory && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {exerciseCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="relative w-full h-[140px] flex flex-col items-center justify-center group"
                >
                  <div className="absolute inset-0 bg-black/50 rounded-[28px] border-2 border-[#0ae7f2]" />
                  <div className="relative text-[#0AE7F2] mb-2 h-16 flex items-center transition-transform duration-300 group-hover:scale-110">
                    {typeof category.icon === 'function' ? (
                      <category.icon />
                    ) : (
                      <category.icon size={40} className="text-[#0AE7F2]" />
                    )}
                  </div>
                  <span className="relative text-sm font-medium text-[#0AE7F2]">{category.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Exercise List */}
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="bg-[#1A1F2E]/60 text-[#0AE7F2] px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  <span>العودة للفئات</span>
                </button>
                <h2 className="text-lg font-bold">
                  تمارين {exerciseCategories.find(c => c.id === selectedCategory)?.name}
                </h2>
              </div>

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
                  <p className="text-gray-400">لا توجد تمارين متاحة لهذه الفئة</p>
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
          )}
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