/*
  # Add custom performance calculation function

  1. New Function
    - calculate_custom_performance
      - Takes trainee_id and custom weights for exercises and meals
      - Returns weighted performance value
      - Allows customizing the importance of exercises vs meals
*/

-- Create function to calculate custom performance
CREATE OR REPLACE FUNCTION calculate_custom_performance(
  p_trainee_id uuid,
  p_exercise_weight float DEFAULT 0.6,
  p_meal_weight float DEFAULT 0.4,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS integer AS $$
DECLARE
  v_completed_exercises integer;
  v_completed_meals integer;
  v_total_exercises integer;
  v_total_meals integer;
  v_exercise_progress float;
  v_meal_progress float;
  v_weighted_progress integer;
BEGIN
  -- Validate weights sum to 1
  IF (p_exercise_weight + p_meal_weight) != 1.0 THEN
    RAISE EXCEPTION 'Weights must sum to 1.0';
  END IF;

  -- Get completed exercises
  SELECT COUNT(*)
  INTO v_completed_exercises
  FROM trainee_exercises
  WHERE trainee_id = p_trainee_id
  AND status = 'completed'
  AND DATE(completed_at) = p_date;

  -- Get completed meals
  SELECT COUNT(*)
  INTO v_completed_meals
  FROM trainee_meals
  WHERE trainee_id = p_trainee_id
  AND status = 'consumed'
  AND DATE(consumed_at) = p_date;

  -- Get total assigned exercises
  SELECT COUNT(*)
  INTO v_total_exercises
  FROM trainee_exercises
  WHERE trainee_id = p_trainee_id
  AND DATE(created_at) = p_date;

  -- Get total assigned meals
  SELECT COUNT(*)
  INTO v_total_meals
  FROM trainee_meals
  WHERE trainee_id = p_trainee_id
  AND DATE(created_at) = p_date;

  -- Calculate individual progress percentages
  IF v_total_exercises > 0 THEN
    v_exercise_progress := (v_completed_exercises::float / v_total_exercises::float) * 100;
  ELSE
    v_exercise_progress := 0;
  END IF;

  IF v_total_meals > 0 THEN
    v_meal_progress := (v_completed_meals::float / v_total_meals::float) * 100;
  ELSE
    v_meal_progress := 0;
  END IF;

  -- Calculate weighted progress
  v_weighted_progress := (
    (v_exercise_progress * p_exercise_weight) +
    (v_meal_progress * p_meal_weight)
  )::integer;

  -- Update performance record with custom calculation
  UPDATE trainee_performance
  SET 
    completed_exercises = v_completed_exercises,
    completed_meals = v_completed_meals,
    progress_value = v_weighted_progress
  WHERE trainee_id = p_trainee_id
  AND date = p_date;

  -- Insert if not exists
  IF NOT FOUND THEN
    INSERT INTO trainee_performance (
      trainee_id,
      date,
      completed_exercises,
      completed_meals,
      progress_value
    ) VALUES (
      p_trainee_id,
      p_date,
      v_completed_exercises,
      v_completed_meals,
      v_weighted_progress
    );
  END IF;

  RETURN v_weighted_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;