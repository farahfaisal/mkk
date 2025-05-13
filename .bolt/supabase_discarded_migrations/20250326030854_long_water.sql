/*
  # Fix duplicate trainee records

  1. Changes
    - Remove duplicate trainee records
    - Ensure unique email constraint
*/

-- First, remove any duplicate trainee records, keeping only the most recently created one
DELETE FROM trainees a USING (
  SELECT email, MAX(created_at) as max_created_at
  FROM trainees
  GROUP BY email
  HAVING COUNT(*) > 1
) b
WHERE a.email = b.email 
AND a.created_at < b.max_created_at;

-- Now insert new trainee with a different email to avoid conflict
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
    'متدرب جديد',
    'trainee@powerhouse.com',
    '970591234567',
    75,
    75,
    70,
    175,
    20,
    40,
    ARRAY['weight_loss', 'muscle_gain']::text[],
    'basic',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'active'
  )
ON CONFLICT (email) DO NOTHING;