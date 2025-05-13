/*
  # Add sample trainees

  1. Changes
    - Insert multiple trainee records with different plans and goals
    - Set subscription dates and statuses
*/

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