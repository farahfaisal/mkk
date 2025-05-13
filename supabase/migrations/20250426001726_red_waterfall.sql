/*
  # Add target steps management

  1. Changes
    - Add functions to manage target steps for trainees
    - Update existing functions to include step data in performance calculation
    - Add admin capabilities to set target steps for trainees
*/

-- Create function to update target steps for a trainee
CREATE OR REPLACE FUNCTION update_trainee_target_steps(
  p_trainee_id uuid,
  p_target_steps integer
)
RETURNS void AS $$
BEGIN
  -- Validate target steps
  IF p_target_steps < 1000 OR p_target_steps > 20000 THEN
    RAISE EXCEPTION 'Target steps must be between 1000 and 20000';
  END IF;

  -- Get today's date
  DECLARE
    v_today date := CURRENT_DATE;
  BEGIN
    -- Update all future records for this trainee
    UPDATE trainee_steps
    SET 
      target_steps = p_target_steps,
      updated_at = now()
    WHERE 
      trainee_id = p_trainee_id
      AND date >= v_today;
      
    -- If no records were updated, insert a new record for today
    IF NOT FOUND THEN
      INSERT INTO trainee_steps (
        trainee_id,
        date,
        steps,
        target_steps
      ) VALUES (
        p_trainee_id,
        v_today,
        0,
        p_target_steps
      );
    END IF;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get trainee's current target steps
CREATE OR REPLACE FUNCTION get_trainee_target_steps(
  p_trainee_id uuid
)
RETURNS integer AS $$
DECLARE
  v_target_steps integer;
BEGIN
  -- Get the most recent target steps for this trainee
  SELECT target_steps INTO v_target_steps
  FROM trainee_steps
  WHERE trainee_id = p_trainee_id
  ORDER BY date DESC
  LIMIT 1;
  
  -- Return default if no records found
  RETURN COALESCE(v_target_steps, 3000);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get step statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_step_statistics()
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'totalSteps', COALESCE(SUM(steps), 0),
    'averageSteps', ROUND(COALESCE(AVG(steps), 0)),
    'maxSteps', COALESCE(MAX(steps), 0),
    'traineesReachingTarget', COUNT(DISTINCT trainee_id) FILTER (WHERE steps >= target_steps),
    'totalTrainees', COUNT(DISTINCT trainee_id),
    'averageTargetSteps', ROUND(AVG(target_steps)),
    'averageCompletion', ROUND(AVG(
      CASE
        WHEN target_steps = 0 THEN 0
        ELSE (steps::numeric / target_steps::numeric) * 100
      END
    ), 2)
  )
  INTO v_result
  FROM trainee_steps
  WHERE date >= CURRENT_DATE - interval '30 days';

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_detailed_stats function to include step statistics
CREATE OR REPLACE FUNCTION get_detailed_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  step_stats jsonb;
BEGIN
  -- Get step statistics
  SELECT get_admin_step_statistics() INTO step_stats;

  -- Build complete stats object including step stats
  stats := jsonb_build_object(
    'stepStats', step_stats,
    'lastUpdated', CURRENT_TIMESTAMP
  );

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;