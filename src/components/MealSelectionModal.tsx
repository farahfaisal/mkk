import React, { useState, useEffect } from 'react';
import { Search, Apple, CheckCircle, X, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConnected } from '../lib/supabase';
import { MealSearchAssignment } from './MealSearchAssignment';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
  status: string;
}

interface MealSelectionModalProps {
  onClose: () => void;
  onAssign: (mealId: string) => void;
}

export function MealSelectionModal({ onClose, onAssign }: MealSelectionModalProps) {
  const [showMealSearch, setShowMealSearch] = useState(true);

  const handleMealSelect = (mealId: string) => {
    onAssign(mealId);
  };

  return (
    <MealSearchAssignment
      onBack={onClose}
      onAssign={handleMealSelect}
    />
  );
}