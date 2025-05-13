/*
  # Add step tracking functionality

  1. New Tables
    - trainee_steps: Stores daily step counts for trainees
      - Steps count
      - Target steps
      - Date tracking
      - Timestamps

  2. Security
    - Enable RLS
    - Add policies for admin and trainee access
    - Secure data access and updates

  3. Functions
    - Calculate step progress
    - Get weekly step data
*/

-- Create trainee_steps table
CREATE TABLE IF NOT EXISTS trainee_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id uuid NOT NULL REFERENCES trainee_profiles(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  steps integer NOT NULL DEFAULT 0,
  target_steps integer NOT NULL DEFAULT 3000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add unique constraint to prevent duplicate entries per day
  CONSTRAINT unique_trainee_date_steps UNIQUE (trainee_id, date),

  -- Add constraints for valid values
  CONSTRAINT valid_steps CHECK (steps >= 0),
  CONSTRAINT valid_target_steps CHECK (target_steps > 0)
);

-- Create indexes
CREATE INDEX trainee_steps_trainee_id_idx ON trainee_steps(trainee_id);
CREATE INDEX trainee_steps_date_idx ON trainee_steps(date);

-- Enable RLS
ALTER TABLE trainee_steps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access to trainee_steps"
  ON trainee_steps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainees to read own steps"
  ON trainee_steps
  FOR SELECT
  TO authenticated
  USING (trainee_id = auth.uid());

CREATE POLICY "Allow trainees to update own steps"
  ON trainee_steps
  FOR UPDATE
  TO authenticated
  USING (trainee_id = auth.uid())
  WITH CHECK (trainee_id = auth.uid());

CREATE POLICY "Allow trainees to insert own steps"
  ON trainee_steps
  FOR INSERT
  TO authenticated
  WITH CHECK (trainee_id = auth.uid());

-- Create function to get weekly steps
CREATE OR REPLACE FUNCTION get_weekly_steps(
  p_trainee_id uuid,
  p_start_date date DEFAULT date_trunc('week', CURRENT_DATE)::date
)
RETURNS TABLE (
  date date,
  steps integer,
  target_steps integer,
  progress numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d::date as date,
    COALESCE(s.steps, 0) as steps,
    COALESCE(s.target_steps, 3000) as target_steps,
    CASE
      WHEN COALESCE(s.steps, 0) = 0 OR COALESCE(s.target_steps, 3000) = 0 THEN 0
      ELSE ROUND((COALESCE(s.steps, 0)::numeric / COALESCE(s.target_steps, 3000)::numeric) * 100, 2)
    END as progress
  FROM generate_series(
    p_start_date,
    p_start_date + interval '6 days',
    interval '1 day'
  ) d
  LEFT JOIN trainee_steps s ON s.trainee_id = p_trainee_id AND s.date = d::date
  ORDER BY d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get step statistics
CREATE OR REPLACE FUNCTION get_step_statistics(
  p_trainee_id uuid,
  p_days integer DEFAULT 30
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalSteps', COALESCE(SUM(steps), 0),
    'averageSteps', ROUND(COALESCE(AVG(steps), 0)),
    'maxSteps', COALESCE(MAX(steps), 0),
    'daysReachedTarget', COUNT(*) FILTER (WHERE steps >= target_steps),
    'totalDays', COUNT(*),
    'averageProgress', ROUND(AVG(
      CASE
        WHEN target_steps = 0 THEN 0
        ELSE (steps::numeric / target_steps::numeric) * 100
      END
    ), 2)
  )
  INTO v_result
  FROM trainee_steps
  WHERE trainee_id = p_trainee_id
  AND date >= CURRENT_DATE - (p_days || ' days')::interval;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample step data
DO $$ 
DECLARE
  v_trainee_id uuid;
  v_current_date date := CURRENT_DATE;
  i integer;
BEGIN
  -- Get trainee IDs
  FOR v_trainee_id IN 
    SELECT id FROM trainee_profiles
  LOOP
    -- Insert sample data for the past week
    FOR i IN 0..6 LOOP
      INSERT INTO trainee_steps (
        trainee_id,
        date,
        steps,
        target_steps
      ) VALUES (
        v_trainee_id,
        v_current_date - i,
        floor(random() * 3500 + 500)::integer, -- 500-4000 steps
        3000 -- Default target
      )
      ON CONFLICT (trainee_id, date) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Update performance calculation to include steps
CREATE OR REPLACE FUNCTION calculate_trainee_performance(
  p_trainee_id uuid,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS integer AS $$
DECLARE
  v_completed_exercises integer;
  v_completed_meals integer;
  v_steps integer;
  v_target_steps integer;
  v_step_progress numeric;
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
  
  -- Get steps for the day
  SELECT steps, target_steps
  INTO v_steps, v_target_steps
  FROM trainee_steps
  WHERE trainee_id = p_trainee_id
  AND date = p_date;
  
  -- Calculate step progress
  IF v_steps IS NULL THEN
    v_steps := 0;
    v_target_steps := 3000;
  END IF;
  
  v_step_progress := LEAST(1, v_steps::numeric / v_target_steps::numeric);

  -- Calculate progress value (50% exercises, 30% meals, 20% steps)
  v_progress_value := (
    (v_completed_exercises * 50 / GREATEST(v_completed_exercises, 1)) +
    (v_completed_meals * 30 / GREATEST(v_completed_meals, 1)) +
    (v_step_progress * 20)
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