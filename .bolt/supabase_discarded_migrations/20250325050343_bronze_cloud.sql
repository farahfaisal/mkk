/*
  # Add sample exercises and trainees

  1. Changes
    - Add sample exercises
    - Add sample trainees
*/

-- Insert sample exercises
INSERT INTO exercises (name, category, sets, reps, description, video_url) VALUES
  (
    'بنش بريس',
    'chest',
    4,
    12,
    'تمرين لتقوية عضلات الصدر العلوية',
    'https://player.vimeo.com/video/915685526'
  ),
  (
    'سكوات',
    'legs',
    3,
    15,
    'تمرين لتقوية عضلات الأرجل',
    'https://player.vimeo.com/video/915685526'
  ),
  (
    'ديدليفت',
    'back',
    4,
    10,
    'تمرين لتقوية عضلات الظهر',
    'https://player.vimeo.com/video/915685526'
  ),
  (
    'عضلات البطن',
    'abs',
    3,
    20,
    'تمرين لتقوية عضلات البطن',
    'https://player.vimeo.com/video/915685526'
  ),
  (
    'تمرين الكتف',
    'shoulders',
    4,
    12,
    'تمرين لتقوية عضلات الكتف',
    'https://player.vimeo.com/video/915685526'
  );

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