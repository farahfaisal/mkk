/*
  # Add sample trainee

  1. Changes
    - Insert sample trainee with complete profile
    - Add realistic training goals and metrics
*/

-- Insert sample trainee with complete profile
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
    'متدرب تجريبي',
    'demo@powerhouse.com',
    '970591234567',
    80,
    80,
    75,
    178,
    22,
    45,
    ARRAY['weight_loss', 'muscle_gain', 'fitness']::text[],
    'premium',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '90 days',
    'active'
  )
ON CONFLICT (email) DO NOTHING;