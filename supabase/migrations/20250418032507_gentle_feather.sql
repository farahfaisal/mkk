/*
  # Create meals table and update stats functions

  1. New Tables
    - meals
      - Basic info (name, calories, nutrients)
      - Category and timing
      - Status tracking
      - Timestamps
  
  2. Security
    - Enable RLS
    - Add policies for admin and trainee access
    
  3. Functions
    - Update stats functions to include meal data
*/

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calories integer NOT NULL,
  protein numeric(5,1) NOT NULL,
  carbs numeric(5,1) NOT NULL,
  fat numeric(5,1) NOT NULL,
  description text,
  category text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_meal_category CHECK (
    category = ANY(ARRAY['breakfast', 'lunch', 'dinner', 'snack'])
  ),
  CONSTRAINT valid_meal_status CHECK (
    status = ANY(ARRAY['active', 'pending', 'inactive'])
  ),
  CONSTRAINT valid_nutrients CHECK (
    calories >= 0 AND
    protein >= 0 AND
    carbs >= 0 AND
    fat >= 0
  )
);

-- Create indexes
CREATE INDEX meals_category_idx ON meals(category);
CREATE INDEX meals_status_idx ON meals(status);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access to meals"
  ON meals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainees to read active meals"
  ON meals
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Insert sample meals
INSERT INTO meals (name, calories, protein, carbs, fat, description, category) VALUES
-- Breakfast meals
('شوفان بالموز', 350, 12, 45, 8, 'شوفان مطبوخ مع حليب لوز، موز طازج، ولوز مقطع', 'breakfast'),
('بيض مسلوق مع خبز', 280, 15, 30, 10, 'بيضتان مسلوقتان مع خبز أسمر', 'breakfast'),
('سلطة فواكه', 200, 5, 35, 3, 'تشكيلة من الفواكه الطازجة', 'breakfast'),

-- Lunch meals
('صدر دجاج مشوي', 450, 35, 20, 15, 'صدر دجاج مشوي مع خضروات مشوية', 'lunch'),
('سمك سلمون', 400, 30, 15, 20, 'سمك سلمون مشوي مع أرز بني', 'lunch'),
('عدس مع أرز', 350, 15, 50, 5, 'عدس مطبوخ مع أرز بني', 'lunch'),

-- Dinner meals
('سلطة تونة', 300, 25, 15, 12, 'سلطة خضراء مع تونة وزيت زيتون', 'dinner'),
('شوربة خضار', 180, 8, 25, 5, 'شوربة خضار مع قطع دجاج', 'dinner'),
('كينوا بالخضار', 320, 12, 40, 10, 'كينوا مطبوخة مع خضروات مشكلة', 'dinner'),

-- Snacks
('لوز نيء', 160, 6, 5, 14, 'حفنة من اللوز النيء', 'snack'),
('زبادي يوناني', 130, 15, 8, 3, 'زبادي يوناني مع العسل', 'snack'),
('موز', 105, 1, 27, 0, 'موزة متوسطة الحجم', 'snack')
ON CONFLICT DO NOTHING;

-- Update get_detailed_stats function to include meal stats
CREATE OR REPLACE FUNCTION get_detailed_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  subscription_counts jsonb;
  status_counts jsonb;
  meal_counts jsonb;
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

  -- Build complete stats object
  stats := jsonb_build_object(
    'totalUsers', (SELECT COUNT(*) FROM trainee_profiles),
    'activeUsers', (SELECT COUNT(*) FROM trainee_profiles WHERE status = 'active'),
    'totalRevenue', calculate_revenue(),
    'newSubscriptions', count_new_subscriptions(),
    'subscriptionDistribution', subscription_counts,
    'statusDistribution', status_counts,
    'mealDistribution', meal_counts,
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
    'averageCalories', (
      SELECT ROUND(AVG(calories)::numeric, 1)
      FROM meals
      WHERE status = 'active'
    ),
    'lastUpdated', CURRENT_TIMESTAMP
  );

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;