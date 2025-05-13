/*
  # Check trainees in database

  1. Changes
    - Create trainees table if not exists
    - Add sample trainees
*/

-- Create trainees table if not exists
CREATE TABLE IF NOT EXISTS trainees (
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

-- Create policy for trainees
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

-- Insert sample trainees
INSERT INTO trainees (
  name,
  email,
  phone,
  initial_weight,
  current_weight,
  target_weight,
  height,
  fat_percentage,
  muscle_mass,
  goal,
  subscription_plan,
  subscription_start,
  subscription_end,
  status
) VALUES 
  (
    'محمد خلف',
    'mk@powerhouse.com',
    '970591234567',
    75,
    75,
    70,
    175,
    20,
    40,
    ARRAY['weight_loss', 'muscle_gain']::text[],
    'premium',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'active'
  ),
  (
    'أحمد محمد',
    'ahmed@example.com',
    '970599876543',
    85,
    85,
    80,
    180,
    25,
    35,
    ARRAY['weight_loss']::text[],
    'basic',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'active'
  ),
  (
    'سارة علي',
    'sara@example.com',
    '970594567890',
    65,
    65,
    60,
    165,
    22,
    30,
    ARRAY['fitness']::text[],
    'pro',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '90 days',
    'active'
  );