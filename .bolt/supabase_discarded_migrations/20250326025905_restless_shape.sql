/*
  # Create trainee exercises schema

  1. New Tables
    - trainee_exercises
      - Track assigned exercises for trainees
      - Store completion status and progress
      - Link exercises to trainees

  2. Security
    - Enable RLS
    - Add policies for proper access control
*/

-- Create trainee_exercises table if not exists
CREATE TABLE IF NOT EXISTS trainee_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id uuid REFERENCES trainees(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  sets integer NOT NULL,
  reps integer NOT NULL,
  weight decimal,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'skipped'))
);

-- Enable RLS
ALTER TABLE trainee_exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Trainers can manage trainee exercises" ON trainee_exercises;

-- Create policies
CREATE POLICY "Trainers can manage trainee exercises"
  ON trainee_exercises
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'trainer'
    )
  );

-- Create indexes
CREATE INDEX trainee_exercises_trainee_id_idx ON trainee_exercises(trainee_id);
CREATE INDEX trainee_exercises_exercise_id_idx ON trainee_exercises(exercise_id);
CREATE INDEX trainee_exercises_status_idx ON trainee_exercises(status);

-- Create updated_at trigger
CREATE TRIGGER update_trainee_exercises_updated_at
  BEFORE UPDATE ON trainee_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();