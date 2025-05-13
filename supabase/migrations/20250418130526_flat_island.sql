/*
  # Create exercises table and related functions

  1. New Tables
    - exercises
      - Basic info (name, category, sets, reps)
      - Video URL and description
      - Status tracking
      - Timestamps

  2. Security
    - Enable RLS
    - Add policies for admin and trainee access
    
  3. Functions
    - Update stats functions to include exercise data
*/

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  sets integer NOT NULL,
  reps integer NOT NULL,
  description text,
  video_url text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_exercise_category CHECK (
    category = ANY(ARRAY[
      'cardio',
      'back',
      'chest',
      'shoulders',
      'legs',
      'abs',
      'biceps',
      'triceps'
    ])
  ),
  CONSTRAINT valid_exercise_status CHECK (
    status = ANY(ARRAY['active', 'pending', 'inactive'])
  ),
  CONSTRAINT valid_sets_reps CHECK (
    sets > 0 AND sets <= 10 AND
    reps > 0 AND reps <= 100
  )
);

-- Create indexes
CREATE INDEX exercises_category_idx ON exercises(category);
CREATE INDEX exercises_status_idx ON exercises(status);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access to exercises"
  ON exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainees to read active exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Insert sample exercises
INSERT INTO exercises (name, category, sets, reps, description) VALUES
-- Chest exercises
('بنش بريس بالبار', 'chest', 4, 12, 'تمرين أساسي لتقوية عضلات الصدر باستخدام البار'),
('دمبل بريس', 'chest', 3, 12, 'تمرين لتقوية عضلات الصدر باستخدام الدمبل'),
('بوش اب', 'chest', 3, 15, 'تمرين الضغط لتقوية عضلات الصدر'),

-- Back exercises
('ديدليفت', 'back', 4, 10, 'تمرين أساسي لتقوية عضلات الظهر والأرجل'),
('بول اب', 'back', 4, 8, 'تمرين السحب لتقوية عضلات الظهر العلوية'),
('بنت اوفر رو', 'back', 3, 12, 'تمرين لتقوية عضلات الظهر السفلية'),

-- Legs exercises
('سكوات', 'legs', 4, 12, 'تمرين أساسي لتقوية عضلات الأرجل'),
('ليج بريس', 'legs', 3, 15, 'تمرين لتقوية عضلات الأرجل باستخدام الجهاز'),
('كالف ريزس', 'legs', 3, 20, 'تمرين لتقوية عضلات الساق'),

-- Shoulders exercises
('شولدر بريس', 'shoulders', 4, 12, 'تمرين لتقوية عضلات الكتف'),
('لاتيرال ريز', 'shoulders', 3, 15, 'تمرين لتقوية عضلات الكتف الجانبية'),
('فرونت ريز', 'shoulders', 3, 15, 'تمرين لتقوية عضلات الكتف الأمامية'),

-- Arms exercises
('بايسبس كيرل', 'biceps', 3, 12, 'تمرين لتقوية عضلات الذراع الأمامية'),
('ترايسبس بوشداون', 'triceps', 3, 12, 'تمرين لتقوية عضلات الذراع الخلفية'),
('هامر كيرل', 'biceps', 3, 12, 'تمرين لتقوية عضلات الذراع الأمامية بوضعية مختلفة'),

-- Abs exercises
('كرانشز', 'abs', 3, 20, 'تمرين لتقوية عضلات البطن العلوية'),
('بلانك', 'abs', 3, 60, 'تمرين ثابت لتقوية عضلات البطن الأساسية'),
('روشن رايز', 'abs', 3, 15, 'تمرين لتقوية عضلات البطن السفلية'),

-- Cardio exercises
('جري', 'cardio', 1, 30, 'تمرين الجري لمدة 30 دقيقة'),
('دراجة ثابتة', 'cardio', 1, 20, 'تمرين الدراجة الثابتة لمدة 20 دقيقة'),
('حبل القفز', 'cardio', 3, 100, 'تمرين القفز بالحبل')
ON CONFLICT DO NOTHING;

-- Update get_detailed_stats function to include exercise stats
CREATE OR REPLACE FUNCTION get_detailed_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  subscription_counts jsonb;
  status_counts jsonb;
  meal_counts jsonb;
  exercise_counts jsonb;
BEGIN
  -- Get subscription plan distribution
  SELECT jsonb_build_object(
    'basic', COUNT(*) FILTER (WHERE subscription_plan = 'basic'),
    'premium', COUNT(*) FILTER (WHERE subscription_plan = 'premium'),
    'pro', COUNT(*) FILTER (WHERE subscription_plan = 'pro')
  )
  INTO subscription_counts
  FROM trainee_profiles;

  -- Get status distribution
  SELECT jsonb_build_object(
    'active', COUNT(*) FILTER (WHERE status = 'active'),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'inactive', COUNT(*) FILTER (WHERE status = 'inactive')
  )
  INTO status_counts
  FROM trainee_profiles;

  -- Get meal category distribution
  SELECT jsonb_build_object(
    'breakfast', COUNT(*) FILTER (WHERE category = 'breakfast'),
    'lunch', COUNT(*) FILTER (WHERE category = 'lunch'),
    'dinner', COUNT(*) FILTER (WHERE category = 'dinner'),
    'snack', COUNT(*) FILTER (WHERE category = 'snack')
  )
  INTO meal_counts
  FROM meals
  WHERE status = 'active';

  -- Get exercise category distribution
  SELECT jsonb_build_object(
    'cardio', COUNT(*) FILTER (WHERE category = 'cardio'),
    'back', COUNT(*) FILTER (WHERE category = 'back'),
    'chest', COUNT(*) FILTER (WHERE category = 'chest'),
    'shoulders', COUNT(*) FILTER (WHERE category = 'shoulders'),
    'legs', COUNT(*) FILTER (WHERE category = 'legs'),
    'abs', COUNT(*) FILTER (WHERE category = 'abs'),
    'biceps', COUNT(*) FILTER (WHERE category = 'biceps'),
    'triceps', COUNT(*) FILTER (WHERE category = 'triceps')
  )
  INTO exercise_counts
  FROM exercises
  WHERE status = 'active';

  -- Build complete stats object
  stats := jsonb_build_object(
    'totalUsers', (SELECT COUNT(*) FROM trainee_profiles),
    'activeUsers', (SELECT COUNT(*) FROM trainee_profiles WHERE status = 'active'),
    'totalRevenue', calculate_revenue(),
    'newSubscriptions', count_new_subscriptions(),
    'subscriptionDistribution', subscription_counts,
    'statusDistribution', status_counts,
    'mealDistribution', meal_counts,
    'exerciseDistribution', exercise_counts,
    'averageWeight', (
      SELECT ROUND(AVG(current_weight)::numeric, 1)
      FROM trainee_profiles
      WHERE current_weight > 0
    ),
    'averageProgress', (
      SELECT ROUND(AVG(
        CASE 
          WHEN initial_weight > current_weight 
          THEN ((initial_weight - current_weight) / (initial_weight - target_weight) * 100)
          ELSE 0
        END
      )::numeric, 1)
      FROM trainee_profiles
      WHERE initial_weight > target_weight
    ),
    'totalMeals', (SELECT COUNT(*) FROM meals WHERE status = 'active'),
    'totalExercises', (SELECT COUNT(*) FROM exercises WHERE status = 'active'),
    'lastUpdated', CURRENT_TIMESTAMP
  );

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;