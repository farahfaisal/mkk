/*
  # Add trainee and exercise assignments

  1. Changes
    - Insert trainee record
    - Add exercise assignments table
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
  subscription_plan,
  subscription_start,
  subscription_end,
  status
) VALUES (
  'متدرب جديد',
  'user@powerhouse.com',
  '970591234567',
  75,
  75,
  70,
  175,
  'basic',
  now(),
  now() + interval '30 days',
  'active'
);