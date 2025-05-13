/*
  # Create weekly performance tracking system

  1. New Tables
    - trainee_performance: Stores daily performance metrics
      - Completed exercises and meals
      - Overall progress value
      - Daily stats and trends

  2. Security
    - Enable RLS
    - Add policies for admin and trainee access
    - Secure data access and updates

  3. Functions
    - Calculate daily and weekly performance
    - Track progress over time
    - Generate performance reports
*/

-- Create trainee_performance table
CREATE TABLE IF NOT EXISTS trainee_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id uuid NOT NULL REFERENCES trainee_profiles(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed_exercises integer DEFAULT 0,
  completed_meals integer DEFAULT 0,
  progress_value integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add unique constraint to prevent duplicate entries per day
  CONSTRAINT unique_trainee_date UNIQUE (trainee_id, date),

  -- Add constraints for valid values
  CONSTRAINT valid_completed_exercises CHECK (completed_exercises >= 0),
  CONSTRAINT valid_completed_meals CHECK (completed_meals >= 0),
  CONSTRAINT valid_progress_value CHECK (progress_value BETWEEN 0 AND 100)
);

-- Create indexes
CREATE INDEX trainee_performance_trainee_id_idx ON trainee_performance(trainee_id);
CREATE INDEX trainee_performance_date_idx ON trainee_performance(date);

-- Enable RLS
ALTER TABLE trainee_performance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access to trainee_performance"
  ON trainee_performance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainees to read own performance"
  ON trainee_performance
  FOR SELECT
  TO authenticated
  USING (trainee_id = auth.uid());

-- Create function to calculate trainee performance
CREATE OR REPLACE FUNCTION calculate_trainee_performance(
  p_trainee_id uuid,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS integer AS $$
DECLARE
  v_completed_exercises integer;
  v_completed_meals integer;
  v_progress_value integer;
BEGIN
  -- Get completed exercises for the day
  SELECT COUNT(*)
  INTO v_completed_exercises
  FROM trainee_exercises
  WHERE trainee_id = p_trainee_id
  AND status = 'completed'
  AND DATE(completed_at) = p_date;

  -- Get completed meals for the day
  SELECT COUNT(*)
  INTO v_completed_meals
  FROM trainee_meals
  WHERE trainee_id = p_trainee_id
  AND status = 'consumed'
  AND DATE(consumed_at) = p_date;

  -- Calculate progress value (60% exercises, 40% meals)
  -- This can be adjusted based on your requirements
  v_progress_value := (
    (v_completed_exercises * 60 / GREATEST(v_completed_exercises, 1)) +
    (v_completed_meals * 40 / GREATEST(v_completed_meals, 1))
  );

  -- Update or insert performance record
  INSERT INTO trainee_performance (
    trainee_id,
    date,
    completed_exercises,
    completed_meals,
    progress_value
  ) VALUES (
    p_trainee_id,
    p_date,
    v_completed_exercises,
    v_completed_meals,
    v_progress_value
  )
  ON CONFLICT (trainee_id, date)
  DO UPDATE SET
    completed_exercises = EXCLUDED.completed_exercises,
    completed_meals = EXCLUDED.completed_meals,
    progress_value = EXCLUDED.progress_value,
    updated_at = now();

  RETURN v_progress_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get weekly performance
CREATE OR REPLACE FUNCTION get_weekly_performance(
  p_trainee_id uuid,
  p_start_date date DEFAULT date_trunc('week', CURRENT_DATE)::date
)
RETURNS TABLE (
  date date,
  completed_exercises integer,
  completed_meals integer,
  progress_value integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d::date as date,
    COALESCE(p.completed_exercises, 0) as completed_exercises,
    COALESCE(p.completed_meals, 0) as completed_meals,
    COALESCE(p.progress_value, 0) as progress_value
  FROM generate_series(
    p_start_date,
    p_start_date + interval '6 days',
    interval '1 day'
  ) d
  LEFT JOIN trainee_performance p ON p.trainee_id = p_trainee_id AND p.date = d::date
  ORDER BY d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get performance trends
CREATE OR REPLACE FUNCTION get_performance_trends(
  p_trainee_id uuid,
  p_weeks integer DEFAULT 4
)
RETURNS TABLE (
  week_start date,
  avg_progress numeric,
  total_exercises integer,
  total_meals integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('week', p.date)::date as week_start,
    ROUND(AVG(p.progress_value)::numeric, 2) as avg_progress,
    SUM(p.completed_exercises) as total_exercises,
    SUM(p.completed_meals) as total_meals
  FROM trainee_performance p
  WHERE p.trainee_id = p_trainee_id
  AND p.date >= CURRENT_DATE - (p_weeks * 7 || ' days')::interval
  GROUP BY week_start
  ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_detailed_stats function to include performance stats
CREATE OR REPLACE FUNCTION get_detailed_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  performance_stats jsonb;
BEGIN
  -- Get performance statistics
  SELECT jsonb_build_object(
    'averageProgress', (
      SELECT ROUND(AVG(progress_value)::numeric, 2)
      FROM trainee_performance
      WHERE date >= CURRENT_DATE - interval '7 days'
    ),
    'totalCompletedExercises', (
      SELECT SUM(completed_exercises)
      FROM trainee_performance
      WHERE date >= CURRENT_DATE - interval '7 days'
    ),
    'totalCompletedMeals', (
      SELECT SUM(completed_meals)
      FROM trainee_performance
      WHERE date >= CURRENT_DATE - interval '7 days'
    ),
    'topPerformers', (
      SELECT jsonb_agg(row_to_json(top_performers))
      FROM (
        SELECT 
          t.name,
          ROUND(AVG(p.progress_value)::numeric, 2) as avg_progress,
          SUM(p.completed_exercises) as total_exercises,
          SUM(p.completed_meals) as total_meals
        FROM trainee_performance p
        JOIN trainee_profiles t ON t.id = p.trainee_id
        WHERE p.date >= CURRENT_DATE - interval '7 days'
        GROUP BY t.id, t.name
        ORDER BY AVG(p.progress_value) DESC
        LIMIT 5
      ) top_performers
    )
  )
  INTO performance_stats;

  -- Build complete stats object including performance stats
  stats := jsonb_build_object(
    'performanceStats', performance_stats,
    'lastUpdated', CURRENT_TIMESTAMP
  );

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample performance data
DO $$ 
DECLARE
  v_trainee_id uuid;
  v_current_date date := CURRENT_DATE;
  i integer;
BEGIN
  -- Get a trainee ID
  SELECT id INTO v_trainee_id
  FROM trainee_profiles
  WHERE email != 'mk@powerhouse.com'
  LIMIT 1;

  -- Insert sample data for the past week
  IF v_trainee_id IS NOT NULL THEN
    FOR i IN 0..6 LOOP
      INSERT INTO trainee_performance (
        trainee_id,
        date,
        completed_exercises,
        completed_meals,
        progress_value
      ) VALUES (
        v_trainee_id,
        v_current_date - i,
        floor(random() * 5 + 1), -- 1-5 exercises
        floor(random() * 3 + 1), -- 1-3 meals
        floor(random() * 40 + 60) -- 60-100% progress
      )
      ON CONFLICT (trainee_id, date) DO NOTHING;
    END LOOP;
  END IF;
END $$;