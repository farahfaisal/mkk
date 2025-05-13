/*
  # Add trainee record

  1. Changes
    - Insert trainee with basic information
    - Set subscription dates and plan
*/

-- Insert trainee
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
) VALUES (
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
);