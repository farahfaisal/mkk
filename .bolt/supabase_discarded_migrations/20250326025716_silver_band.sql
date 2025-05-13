/*
  # Fix trainee relationships and policies

  1. Changes
    - Add foreign key constraints
    - Add composite indexes
    - Add status tracking
    - Add progress tracking
    - Update policies to use correct columns
*/

-- Drop existing constraints if they exist
ALTER TABLE trainee_exercises DROP CONSTRAINT IF EXISTS fk_trainee_exercises_trainee;
ALTER TABLE trainee_exercises DROP CONSTRAINT IF EXISTS fk_trainee_exercises_exercise;
ALTER TABLE trainee_meals DROP CONSTRAINT IF EXISTS fk_trainee_meals_trainee;
ALTER TABLE trainee_meals DROP CONSTRAINT IF EXISTS fk_trainee_meals_meal;
ALTER TABLE trainee_chats DROP CONSTRAINT IF EXISTS fk_trainee_chats_trainee;
ALTER TABLE trainee_chats DROP CONSTRAINT IF EXISTS fk_trainee_chats_trainer;
ALTER TABLE trainee_notifications DROP CONSTRAINT IF EXISTS fk_trainee_notifications_trainee;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_trainee_exercises_composite;
DROP INDEX IF EXISTS idx_trainee_meals_composite;
DROP INDEX IF EXISTS idx_trainee_chats_composite;

-- Add foreign key constraints
ALTER TABLE trainee_exercises
  ADD CONSTRAINT fk_trainee_exercises_trainee
  FOREIGN KEY (trainee_id)
  REFERENCES trainees(id)
  ON DELETE CASCADE;

ALTER TABLE trainee_exercises
  ADD CONSTRAINT fk_trainee_exercises_exercise
  FOREIGN KEY (exercise_id)
  REFERENCES exercises(id)
  ON DELETE CASCADE;

ALTER TABLE trainee_meals
  ADD CONSTRAINT fk_trainee_meals_trainee
  FOREIGN KEY (trainee_id)
  REFERENCES trainees(id)
  ON DELETE CASCADE;

ALTER TABLE trainee_meals
  ADD CONSTRAINT fk_trainee_meals_meal
  FOREIGN KEY (meal_id)
  REFERENCES meals(id)
  ON DELETE CASCADE;

ALTER TABLE trainee_chats
  ADD CONSTRAINT fk_trainee_chats_trainee
  FOREIGN KEY (trainee_id)
  REFERENCES trainees(id)
  ON DELETE CASCADE;

ALTER TABLE trainee_chats
  ADD CONSTRAINT fk_trainee_chats_trainer
  FOREIGN KEY (trainer_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE trainee_notifications
  ADD CONSTRAINT fk_trainee_notifications_trainee
  FOREIGN KEY (trainee_id)
  REFERENCES trainees(id)
  ON DELETE CASCADE;

-- Create composite indexes
CREATE INDEX idx_trainee_exercises_composite 
  ON trainee_exercises(trainee_id, exercise_id);

CREATE INDEX idx_trainee_meals_composite 
  ON trainee_meals(trainee_id, meal_id);

CREATE INDEX idx_trainee_chats_composite 
  ON trainee_chats(trainee_id, trainer_id);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Trainees can view their own exercises" ON trainee_exercises;
DROP POLICY IF EXISTS "Trainees can view their own meals" ON trainee_meals;
DROP POLICY IF EXISTS "Trainees can view their own chats" ON trainee_chats;
DROP POLICY IF EXISTS "Trainees can view their own notifications" ON trainee_notifications;

-- Add RLS policies
CREATE POLICY "Trainees can view their own exercises"
  ON trainee_exercises
  FOR SELECT
  TO authenticated
  USING (trainee_id IN (
    SELECT id FROM trainees
    WHERE email = auth.email()
  ));

CREATE POLICY "Trainees can view their own meals"
  ON trainee_meals
  FOR SELECT
  TO authenticated
  USING (trainee_id IN (
    SELECT id FROM trainees
    WHERE email = auth.email()
  ));

CREATE POLICY "Trainees can view their own chats"
  ON trainee_chats
  FOR SELECT
  TO authenticated
  USING (
    trainee_id IN (
      SELECT id FROM trainees
      WHERE email = auth.email()
    ) OR
    trainer_id = auth.uid()
  );

CREATE POLICY "Trainees can view their own notifications"
  ON trainee_notifications
  FOR SELECT
  TO authenticated
  USING (trainee_id IN (
    SELECT id FROM trainees
    WHERE email = auth.email()
  ));

-- Add status tracking columns
ALTER TABLE trainee_exercises
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'completed', 'skipped'));

ALTER TABLE trainee_meals
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'consumed', 'skipped'));

-- Add progress tracking
ALTER TABLE trainees
  ADD COLUMN IF NOT EXISTS progress jsonb NOT NULL DEFAULT '{
    "completed_exercises": 0,
    "completed_meals": 0,
    "overall_progress": 0
  }';

-- Create function to update trainee progress
CREATE OR REPLACE FUNCTION update_trainee_progress()
RETURNS TRIGGER AS $$
DECLARE
  completed_exercises integer;
  completed_meals integer;
  overall_progress integer;
BEGIN
  -- Get current progress values
  SELECT 
    COALESCE((progress->>'completed_exercises')::integer, 0),
    COALESCE((progress->>'completed_meals')::integer, 0),
    COALESCE((progress->>'overall_progress')::integer, 0)
  INTO completed_exercises, completed_meals, overall_progress
  FROM trainees
  WHERE id = NEW.trainee_id;

  -- Update progress based on table and status
  IF TG_TABLE_NAME = 'trainee_exercises' AND NEW.status = 'completed' THEN
    completed_exercises := completed_exercises + 1;
    overall_progress := LEAST(100, overall_progress + 5);
  ELSIF TG_TABLE_NAME = 'trainee_meals' AND NEW.status = 'consumed' THEN
    completed_meals := completed_meals + 1;
    overall_progress := LEAST(100, overall_progress + 5);
  END IF;

  -- Update trainees table
  UPDATE trainees
  SET progress = jsonb_build_object(
    'completed_exercises', completed_exercises,
    'completed_meals', completed_meals,
    'overall_progress', overall_progress
  )
  WHERE id = NEW.trainee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_progress_on_exercise ON trainee_exercises;
DROP TRIGGER IF EXISTS update_progress_on_meal ON trainee_meals;

-- Create triggers for progress tracking
CREATE TRIGGER update_progress_on_exercise
  AFTER UPDATE OF status ON trainee_exercises
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_trainee_progress();

CREATE TRIGGER update_progress_on_meal
  AFTER UPDATE OF status ON trainee_meals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_trainee_progress();