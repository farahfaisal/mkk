/*
  # Add sample exercises

  1. Changes
    - Insert sample exercises into exercises table
    - Add variety of exercise types and categories
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