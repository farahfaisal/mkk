/*
  # Insert sample trainee data

  1. Changes
    - Insert sample trainees with realistic data
    - Include variety of subscription plans and statuses
    - Add different fitness goals and measurements
*/

-- Insert sample trainees
INSERT INTO trainee_profiles (
  name,
  email,
  phone,
  password_hash,
  initial_weight,
  current_weight,
  target_weight,
  height,
  fat_percentage,
  muscle_mass,
  goal,
  subscription_plan,
  status
) VALUES 
-- Active premium trainee
(
  'أحمد محمد',
  'ahmed@example.com',
  '970 59 987 6543',
  crypt('User@123', gen_salt('bf')),
  90,
  85,
  80,
  180,
  25,
  45,
  ARRAY['weight_loss'],
  'premium',
  'active'
),
-- Active pro trainee
(
  'سارة علي',
  'sara@example.com',
  '970 59 456 7890',
  crypt('User@123', gen_salt('bf')),
  65,
  60,
  58,
  165,
  22,
  35,
  ARRAY['fitness', 'muscle_gain'],
  'pro',
  'active'
),
-- Pending basic trainee
(
  'خالد عمر',
  'khaled@example.com',
  '970 59 321 6547',
  crypt('User@123', gen_salt('bf')),
  95,
  95,
  85,
  178,
  30,
  40,
  ARRAY['weight_loss', 'fitness'],
  'basic',
  'pending'
),
-- Active basic trainee
(
  'فاطمة أحمد',
  'fatima@example.com',
  '970 59 789 1234',
  crypt('User@123', gen_salt('bf')),
  70,
  68,
  65,
  162,
  24,
  32,
  ARRAY['muscle_gain'],
  'basic',
  'active'
),
-- Inactive premium trainee
(
  'عمر خالد',
  'omar@example.com',
  '970 59 654 3210',
  crypt('User@123', gen_salt('bf')),
  82,
  80,
  75,
  175,
  20,
  50,
  ARRAY['fitness'],
  'premium',
  'inactive'
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  initial_weight = EXCLUDED.initial_weight,
  current_weight = EXCLUDED.current_weight,
  target_weight = EXCLUDED.target_weight,
  height = EXCLUDED.height,
  fat_percentage = EXCLUDED.fat_percentage,
  muscle_mass = EXCLUDED.muscle_mass,
  goal = EXCLUDED.goal,
  subscription_plan = EXCLUDED.subscription_plan,
  status = EXCLUDED.status;