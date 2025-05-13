import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Trainee {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  goals: string[];
  height: number;
  weight: number;
  targetWeight: number;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  stats?: {
    completedExercises: number;
    completedMeals: number;
    progress: number;
  };
  currentWeight?: number;
  initialWeight?: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: number;
  description?: string;
  videoUrl?: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
  timing?: string;
  category: string;
  status: 'active' | 'pending' | 'inactive';
}

// Add mock data for development
const mockExercises: Exercise[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174010',
    name: 'بنش بريس',
    category: 'chest',
    sets: 4,
    reps: 12,
    description: 'تمرين لتقوية عضلات الصدر',
    videoUrl: 'https://player.vimeo.com/video/915685526',
    status: 'active'
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174011',
    name: 'سكوات',
    category: 'legs',
    sets: 3,
    reps: 15,
    description: 'تمرين لتقوية عضلات الأرجل',
    videoUrl: 'https://player.vimeo.com/video/915685526',
    status: 'active'
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174012',
    name: 'ديدليفت',
    category: 'back',
    sets: 4,
    reps: 10,
    description: 'تمرين لتقوية عضلات الظهر',
    videoUrl: 'https://player.vimeo.com/video/915685526',
    status: 'active'
  }
];

const mockMeals: Meal[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174020',
    name: 'شوفان بالموز',
    calories: 350,
    protein: 12,
    carbs: 45,
    fat: 8,
    description: 'وجبة فطور صحية غنية بالألياف',
    timing: 'صباحاً',
    category: 'breakfast',
    status: 'active'
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174021',
    name: 'صدر دجاج مشوي',
    calories: 450,
    protein: 35,
    carbs: 20,
    fat: 15,
    description: 'وجبة غداء غنية بالبروتين',
    timing: 'ظهراً',
    category: 'lunch',
    status: 'active'
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174022',
    name: 'سلمون مشوي',
    calories: 400,
    protein: 30,
    carbs: 15,
    fat: 20,
    description: 'وجبة عشاء صحية غنية بالأوميغا 3',
    timing: 'مساءً',
    category: 'dinner',
    status: 'active'
  }
];

const mockTrainees: Trainee[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174030',
    userId: 'user1',
    name: 'محمد خلف',
    email: 'mk@powerhouse.com',
    phone: '970 59 123 4567',
    plan: 'premium',
    goals: ['weight_loss', 'muscle_gain'],
    height: 175,
    weight: 80,
    targetWeight: 75,
    status: 'active',
    joinDate: '2024-03-01',
    stats: {
      completedExercises: 45,
      completedMeals: 38,
      progress: 75
    },
    currentWeight: 80,
    initialWeight: 85
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174031',
    userId: 'user2',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '970 59 987 6543',
    plan: 'basic',
    goals: ['weight_loss'],
    height: 180,
    weight: 90,
    targetWeight: 85,
    status: 'pending',
    joinDate: '2024-03-15',
    stats: {
      completedExercises: 20,
      completedMeals: 15,
      progress: 35
    },
    currentWeight: 90,
    initialWeight: 95
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174032',
    userId: 'user3',
    name: 'سارة علي',
    email: 'sara@example.com',
    phone: '970 59 456 7890',
    plan: 'pro',
    goals: ['muscle_gain', 'fitness'],
    height: 165,
    weight: 65,
    targetWeight: 60,
    status: 'active',
    joinDate: '2024-03-20',
    stats: {
      completedExercises: 30,
      completedMeals: 25,
      progress: 55
    },
    currentWeight: 65,
    initialWeight: 70
  }
];

// Export mock data
export const getMockData = () => {
  // Try to get data from localStorage first
  try {
    const storedTrainees = localStorage.getItem('trainees');
    const storedExercises = localStorage.getItem('exercises');
    const storedMeals = localStorage.getItem('meals');
    
    return {
      exercises: storedExercises ? JSON.parse(storedExercises) : mockExercises,
      meals: storedMeals ? JSON.parse(storedMeals) : mockMeals,
      trainees: storedTrainees ? JSON.parse(storedTrainees) : mockTrainees
    };
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {
      exercises: mockExercises,
      meals: mockMeals,
      trainees: mockTrainees
    };
  }
};

// Storage Keys
const STORAGE_KEYS = {
  USERS: 'users',
  TRAINEES: 'trainees',
  EXERCISES: 'exercises',
  MEALS: 'meals',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages'
} as const;

// Helper Functions
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage (${key}):`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage (${key}):`, error);
  }
};

// Initialize with sample data if empty
const initializeSampleData = () => {
  try {
    // Initialize trainees
    if (!localStorage.getItem(STORAGE_KEYS.TRAINEES)) {
      localStorage.setItem(STORAGE_KEYS.TRAINEES, JSON.stringify(mockTrainees));
    }
    
    // Initialize exercises
    if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(mockExercises));
    }
    
    // Initialize meals
    if (!localStorage.getItem(STORAGE_KEYS.MEALS)) {
      localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(mockMeals));
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// User Functions
export const getUsers = (): User[] => {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
};

export const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  setItem(STORAGE_KEYS.USERS, users);
  return newUser;
};

// Trainee Functions
export const getTrainees = (): Trainee[] => {
  return getItem<Trainee[]>(STORAGE_KEYS.TRAINEES, []);
};

export const addTrainee = (traineeData: Omit<Trainee, 'id' | 'status' | 'joinDate' | 'stats'>): Trainee => {
  const trainees = getTrainees();
  const newTrainee = {
    id: uuidv4(),
    ...traineeData,
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0],
    stats: {
      completedExercises: 0,
      completedMeals: 0,
      progress: 0
    }
  };
  trainees.push(newTrainee);
  setItem(STORAGE_KEYS.TRAINEES, trainees);
  return newTrainee;
};

export const updateTrainee = (id: string, data: Partial<Trainee>): Trainee => {
  const trainees = getTrainees();
  const index = trainees.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trainee not found');
  
  trainees[index] = { ...trainees[index], ...data };
  setItem(STORAGE_KEYS.TRAINEES, trainees);
  return trainees[index];
};

export const deleteTrainee = (id: string): void => {
  const trainees = getTrainees().filter(t => t.id !== id);
  setItem(STORAGE_KEYS.TRAINEES, trainees);
};

// Exercise Functions
export const getExercises = (): Exercise[] => {
  return getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, []);
};

export const addExercise = (exerciseData: Omit<Exercise, 'id' | 'status'>): Exercise => {
  const exercises = getExercises();
  const newExercise = {
    id: uuidv4(),
    ...exerciseData,
    status: 'active'
  };
  exercises.push(newExercise);
  setItem(STORAGE_KEYS.EXERCISES, exercises);
  return newExercise;
};

// Meal Functions
export const getMeals = (): Meal[] => {
  return getItem<Meal[]>(STORAGE_KEYS.MEALS, []);
};

export const addMeal = (mealData: Omit<Meal, 'id' | 'status'>): Meal => {
  const meals = getMeals();
  const newMeal = {
    id: uuidv4(),
    ...mealData,
    status: 'active'
  };
  meals.push(newMeal);
  setItem(STORAGE_KEYS.MEALS, meals);
  return newMeal;
};

// Stats Functions
export const getStats = () => {
  const trainees = getTrainees();
  const activeTrainees = trainees.filter(t => t.status === 'active');
  const revenue = trainees.reduce((sum, t) => {
    const planPrices = { basic: 99, premium: 199, pro: 299 };
    return sum + (planPrices[t.plan as keyof typeof planPrices] || 0);
  }, 0);

  return {
    totalUsers: trainees.length,
    activeUsers: activeTrainees.length,
    totalRevenue: revenue,
    newSubscriptions: trainees.filter(t => {
      const joinDate = new Date(t.joinDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return joinDate >= thirtyDaysAgo;
    }).length
  };
};

// Trainee Actions
export const addExerciseToTrainee = (traineeId: string): void => {
  const trainees = getTrainees();
  const trainee = trainees.find(t => t.id === traineeId);
  if (!trainee) return;

  trainee.stats = trainee.stats || { completedExercises: 0, completedMeals: 0, progress: 0 };
  trainee.stats.completedExercises++;
  trainee.stats.progress = Math.min(100, trainee.stats.progress + 5);
  
  setItem(STORAGE_KEYS.TRAINEES, trainees);
};

export const addMealToTrainee = (traineeId: string): void => {
  const trainees = getTrainees();
  const trainee = trainees.find(t => t.id === traineeId);
  if (!trainee) return;

  trainee.stats = trainee.stats || { completedExercises: 0, completedMeals: 0, progress: 0 };
  trainee.stats.completedMeals++;
  trainee.stats.progress = Math.min(100, trainee.stats.progress + 5);
  
  setItem(STORAGE_KEYS.TRAINEES, trainees);
};

// Authentication Functions
export const login = (email: string, password: string): { success: boolean; role?: 'admin' | 'user' } => {
  // Admin credentials
  if (email === 'mk@powerhouse.com' && password === 'Admin@123') {
    return { success: true, role: 'admin' };
  }
  
  // User credentials
  if (email === 'user@powerhouse.com' && password === 'User@123') {
    return { success: true, role: 'user' };
  }

  return { success: false };
};

export const logout = (): void => {
  localStorage.removeItem('userType');
};

// Initialize sample data
initializeSampleData();