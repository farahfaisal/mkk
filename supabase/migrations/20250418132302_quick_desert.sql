/*
  # Create weekly exercise and meal schedules

  1. New Tables
    - weekly_schedules: Parent table for schedules
    - schedule_exercises: Exercise assignments
    - schedule_meals: Meal assignments
    
  2. Security
    - Enable RLS
    - Add policies for admin and trainee access
    
  3. Functions
    - Manage schedule assignments
    - Track completion status
*/

-- Create weekly_schedules table
CREATE TABLE IF NOT EXISTS weekly_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id uuid NOT NULL REFERENCES trainee_profiles(id),
  week_start_date date NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add unique constraint to prevent duplicate schedules
  CONSTRAINT unique_trainee_week UNIQUE (trainee_id, week_start_date)
);

-- Create schedule_exercises table
CREATE TABLE IF NOT EXISTS schedule_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES weekly_schedules(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id),
  day_of_week integer NOT NULL, -- 0 = Sunday, 6 = Saturday
  sets integer NOT NULL,
  reps integer NOT NULL,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_day_of_week CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT valid_sets CHECK (sets > 0 AND sets <= 10),
  CONSTRAINT valid_reps CHECK (reps > 0 AND reps <= 100),
  CONSTRAINT valid_exercise_status CHECK (
    status = ANY(ARRAY['pending', 'completed', 'skipped'])
  )
);

-- Create schedule_meals table
CREATE TABLE IF NOT EXISTS schedule_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES weekly_schedules(id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES meals(id),
  day_of_week integer NOT NULL, -- 0 = Sunday, 6 = Saturday
  timing text NOT NULL,
  status text DEFAULT 'pending',
  consumed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_day_of_week CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT valid_meal_timing CHECK (
    timing = ANY(ARRAY['breakfast', 'lunch', 'dinner', 'snack'])
  ),
  CONSTRAINT valid_meal_status CHECK (
    status = ANY(ARRAY['pending', 'consumed', 'skipped'])
  )
);

-- Create indexes
CREATE INDEX weekly_schedules_trainee_id_idx ON weekly_schedules(trainee_id);
CREATE INDEX weekly_schedules_week_start_date_idx ON weekly_schedules(week_start_date);
CREATE INDEX schedule_exercises_schedule_id_idx ON schedule_exercises(schedule_id);
CREATE INDEX schedule_exercises_exercise_id_idx ON schedule_exercises(exercise_id);
CREATE INDEX schedule_exercises_day_of_week_idx ON schedule_exercises(day_of_week);
CREATE INDEX schedule_meals_schedule_id_idx ON schedule_meals(schedule_id);
CREATE INDEX schedule_meals_meal_id_idx ON schedule_meals(meal_id);
CREATE INDEX schedule_meals_day_of_week_idx ON schedule_meals(day_of_week);
CREATE INDEX schedule_meals_timing_idx ON schedule_meals(timing);

-- Enable RLS
ALTER TABLE weekly_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_meals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access to weekly_schedules"
  ON weekly_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainees to read own schedules"
  ON weekly_schedules
  FOR SELECT
  TO authenticated
  USING (trainee_id = auth.uid());

CREATE POLICY "Allow admin full access to schedule_exercises"
  ON schedule_exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainees to read and update own exercises"
  ON schedule_exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM weekly_schedules
      WHERE weekly_schedules.id = schedule_id
      AND weekly_schedules.trainee_id = auth.uid()
    )
  );

CREATE POLICY "Allow admin full access to schedule_meals"
  ON schedule_meals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainees to read and update own meals"
  ON schedule_meals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM weekly_schedules
      WHERE weekly_schedules.id = schedule_id
      AND weekly_schedules.trainee_id = auth.uid()
    )
  );

-- Create function to get weekly schedule
CREATE OR REPLACE FUNCTION get_weekly_schedule(
  p_trainee_id uuid,
  p_week_start_date date DEFAULT date_trunc('week', CURRENT_DATE)::date
)
RETURNS TABLE (
  schedule_id uuid,
  day_of_week integer,
  exercises jsonb,
  meals jsonb
) AS $$
BEGIN
  -- Create schedule if it doesn't exist
  INSERT INTO weekly_schedules (trainee_id, week_start_date)
  VALUES (p_trainee_id, p_week_start_date)
  ON CONFLICT (trainee_id, week_start_date) DO NOTHING;

  RETURN QUERY
  WITH schedule AS (
    SELECT id
    FROM weekly_schedules
    WHERE trainee_id = p_trainee_id
    AND week_start_date = p_week_start_date
  ),
  exercise_data AS (
    SELECT 
      se.day_of_week,
      jsonb_agg(
        jsonb_build_object(
          'id', se.id,
          'exercise_id', se.exercise_id,
          'exercise_name', e.name,
          'exercise_category', e.category,
          'sets', se.sets,
          'reps', se.reps,
          'status', se.status,
          'completed_at', se.completed_at
        )
      ) as exercises
    FROM schedule s
    JOIN schedule_exercises se ON se.schedule_id = s.id
    JOIN exercises e ON e.id = se.exercise_id
    GROUP BY se.day_of_week
  ),
  meal_data AS (
    SELECT 
      sm.day_of_week,
      jsonb_agg(
        jsonb_build_object(
          'id', sm.id,
          'meal_id', sm.meal_id,
          'meal_name', m.name,
          'calories', m.calories,
          'timing', sm.timing,
          'status', sm.status,
          'consumed_at', sm.consumed_at
        )
      ) as meals
    FROM schedule s
    JOIN schedule_meals sm ON sm.schedule_id = s.id
    JOIN meals m ON m.id = sm.meal_id
    GROUP BY sm.day_of_week
  )
  SELECT 
    s.id as schedule_id,
    d.day as day_of_week,
    COALESCE(e.exercises, '[]'::jsonb) as exercises,
    COALESCE(m.meals, '[]'::jsonb) as meals
  FROM schedule s
  CROSS JOIN generate_series(0, 6) as d(day)
  LEFT JOIN exercise_data e ON e.day_of_week = d.day
  LEFT JOIN meal_data m ON m.day_of_week = d.day
  ORDER BY d.day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign exercise
CREATE OR REPLACE FUNCTION assign_exercise(
  p_schedule_id uuid,
  p_exercise_id uuid,
  p_day_of_week integer,
  p_sets integer DEFAULT 3,
  p_reps integer DEFAULT 12
)
RETURNS uuid AS $$
DECLARE
  v_exercise_id uuid;
BEGIN
  -- Verify schedule belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM weekly_schedules
    WHERE id = p_schedule_id
    AND (
      trainee_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.email = 'mk@powerhouse.com'
      )
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Insert exercise assignment
  INSERT INTO schedule_exercises (
    schedule_id,
    exercise_id,
    day_of_week,
    sets,
    reps
  ) VALUES (
    p_schedule_id,
    p_exercise_id,
    p_day_of_week,
    p_sets,
    p_reps
  ) RETURNING id INTO v_exercise_id;

  RETURN v_exercise_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to assign meal
CREATE OR REPLACE FUNCTION assign_meal(
  p_schedule_id uuid,
  p_meal_id uuid,
  p_day_of_week integer,
  p_timing text
)
RETURNS uuid AS $$
DECLARE
  v_meal_id uuid;
BEGIN
  -- Verify schedule belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM weekly_schedules
    WHERE id = p_schedule_id
    AND (
      trainee_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.email = 'mk@powerhouse.com'
      )
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Insert meal assignment
  INSERT INTO schedule_meals (
    schedule_id,
    meal_id,
    day_of_week,
    timing
  ) VALUES (
    p_schedule_id,
    p_meal_id,
    p_day_of_week,
    p_timing
  ) RETURNING id INTO v_meal_id;

  RETURN v_meal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample schedule data
DO $$ 
DECLARE
  v_trainee_id uuid;
  v_schedule_id uuid;
  v_exercise_id uuid;
  v_meal_id uuid;
  v_week_start date := date_trunc('week', CURRENT_DATE)::date;
BEGIN
  -- Get a trainee ID
  SELECT id INTO v_trainee_id
  FROM trainee_profiles
  WHERE email != 'mk@powerhouse.com'
  LIMIT 1;

  IF v_trainee_id IS NOT NULL THEN
    -- Create weekly schedule
    INSERT INTO weekly_schedules (trainee_id, week_start_date)
    VALUES (v_trainee_id, v_week_start)
    RETURNING id INTO v_schedule_id;

    -- Get sample exercise and meal IDs
    SELECT id INTO v_exercise_id FROM exercises LIMIT 1;
    SELECT id INTO v_meal_id FROM meals LIMIT 1;

    IF v_exercise_id IS NOT NULL AND v_meal_id IS NOT NULL THEN
      -- Add sample exercises
      INSERT INTO schedule_exercises (schedule_id, exercise_id, day_of_week, sets, reps)
      VALUES
      (v_schedule_id, v_exercise_id, 0, 3, 12), -- Sunday
      (v_schedule_id, v_exercise_id, 2, 4, 10), -- Tuesday
      (v_schedule_id, v_exercise_id, 4, 3, 15); -- Thursday

      -- Add sample meals
      INSERT INTO schedule_meals (schedule_id, meal_id, day_of_week, timing)
      VALUES
      (v_schedule_id, v_meal_id, 0, 'breakfast'),
      (v_schedule_id, v_meal_id, 0, 'lunch'),
      (v_schedule_id, v_meal_id, 0, 'dinner'),
      (v_schedule_id, v_meal_id, 1, 'breakfast'),
      (v_schedule_id, v_meal_id, 1, 'lunch'),
      (v_schedule_id, v_meal_id, 1, 'dinner');
    END IF;
  END IF;
END $$;