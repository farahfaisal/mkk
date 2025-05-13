/*
  # Fix trainee schema and add functionality

  1. Changes
    - Drop and recreate trainees table with correct constraints
    - Add proper indexes and triggers
    - Update RLS policies
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS trainees CASCADE;

-- Create trainees table with proper schema
CREATE TABLE trainees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  initial_weight decimal NOT NULL,
  current_weight decimal NOT NULL,
  target_weight decimal NOT NULL,
  height decimal NOT NULL,
  fat_percentage decimal,
  muscle_mass decimal,
  goal text[] DEFAULT ARRAY[]::text[],
  subscription_plan text NOT NULL,
  subscription_start timestamptz NOT NULL DEFAULT now(),
  subscription_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'pending', 'inactive')),
  CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('basic', 'premium', 'pro')),
  CONSTRAINT valid_dates CHECK (subscription_end > subscription_start)
);

-- Enable RLS
ALTER TABLE trainees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Trainers can manage trainees" ON trainees;

-- Create policies
CREATE POLICY "Trainers can manage trainees"
  ON trainees
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX trainees_email_idx ON trainees(email);
CREATE INDEX trainees_status_idx ON trainees(status);
CREATE INDEX trainees_subscription_end_idx ON trainees(subscription_end);

-- Create updated_at trigger
CREATE TRIGGER update_trainees_updated_at
  BEFORE UPDATE ON trainees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();