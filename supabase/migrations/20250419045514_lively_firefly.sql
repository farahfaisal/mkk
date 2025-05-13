/*
  # إنشاء بيانات أداء أسبوعية للمتدربين

  1. إضافة بيانات وهمية للأداء الأسبوعي
    - إنشاء سجلات للأيام السبعة الماضية
    - تعيين قيم مختلفة للتمارين والوجبات المكتملة
    - حساب قيم التقدم بناءً على التمارين والوجبات
*/

-- إضافة بيانات أداء أسبوعية للمتدربين
DO $$ 
DECLARE
  v_trainee_id uuid;
  v_current_date date := CURRENT_DATE;
  i integer;
BEGIN
  -- الحصول على معرف المتدرب
  FOR v_trainee_id IN 
    SELECT id FROM trainee_profiles
  LOOP
    -- إنشاء بيانات للأيام السبعة الماضية
    FOR i IN 0..6 LOOP
      INSERT INTO trainee_performance (
        id,
        trainee_id,
        date,
        completed_exercises,
        completed_meals,
        progress_value
      ) VALUES (
        gen_random_uuid(),
        v_trainee_id,
        v_current_date - i,
        floor(random() * 5 + 1)::integer, -- 1-5 تمارين
        floor(random() * 3 + 1)::integer, -- 1-3 وجبات
        floor(random() * 40 + 60)::integer -- 60-100% تقدم
      )
      ON CONFLICT (trainee_id, date) DO UPDATE SET
        completed_exercises = EXCLUDED.completed_exercises,
        completed_meals = EXCLUDED.completed_meals,
        progress_value = EXCLUDED.progress_value,
        updated_at = now();
    END LOOP;
  END LOOP;
END $$;

-- إنشاء دالة لحساب الأداء الأسبوعي
CREATE OR REPLACE FUNCTION calculate_weekly_performance(
  p_trainee_id uuid,
  p_start_date date DEFAULT date_trunc('week', CURRENT_DATE)::date
)
RETURNS TABLE (
  day_of_week integer,
  date date,
  completed_exercises integer,
  completed_meals integer,
  progress_value integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(DOW FROM d)::integer as day_of_week,
    d::date as date,
    COALESCE(p.completed_exercises, 0) as completed_exercises,
    COALESCE(p.completed_meals, 0) as completed_meals,
    COALESCE(p.progress_value, 0) as progress_value
  FROM generate_series(
    p_start_date,
    p_start_date + interval '6 days',
    interval '1 day'
  ) d
  LEFT JOIN trainee_performance p ON p.trainee_id = p_trainee_id AND p.date = d::date
  ORDER BY d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء دالة لتحديث الأداء اليومي
CREATE OR REPLACE FUNCTION update_daily_performance(
  p_trainee_id uuid,
  p_date date,
  p_completed_exercises integer,
  p_completed_meals integer
)
RETURNS integer AS $$
DECLARE
  v_progress_value integer;
  v_exercise_weight float := 0.6;
  v_meal_weight float := 0.4;
  v_max_exercises integer := 5;
  v_max_meals integer := 3;
BEGIN
  -- حساب قيمة التقدم
  v_progress_value := (
    (LEAST(1, p_completed_exercises::float / v_max_exercises) * 100 * v_exercise_weight) +
    (LEAST(1, p_completed_meals::float / v_max_meals) * 100 * v_meal_weight)
  )::integer;

  -- تحديث أو إدخال سجل الأداء
  INSERT INTO trainee_performance (
    id,
    trainee_id,
    date,
    completed_exercises,
    completed_meals,
    progress_value
  ) VALUES (
    gen_random_uuid(),
    p_trainee_id,
    p_date,
    p_completed_exercises,
    p_completed_meals,
    v_progress_value
  )
  ON CONFLICT (trainee_id, date) DO UPDATE SET
    completed_exercises = p_completed_exercises,
    completed_meals = p_completed_meals,
    progress_value = v_progress_value,
    updated_at = now();

  RETURN v_progress_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;