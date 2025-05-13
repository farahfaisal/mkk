/*
  # Add body measurements to trainee_profiles

  1. Changes
    - Add columns for various body measurements
    - Include waist, neck, arm, chest, thigh, and calf circumferences
    - Add constraints to ensure valid values
*/

-- Add body measurement columns to trainee_profiles
DO $$
BEGIN
  -- Add waist circumference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainee_profiles' AND column_name = 'waist_circumference'
  ) THEN
    ALTER TABLE trainee_profiles ADD COLUMN waist_circumference numeric(5,1);
    RAISE NOTICE 'Added waist_circumference column';
  END IF;

  -- Add neck circumference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainee_profiles' AND column_name = 'neck_circumference'
  ) THEN
    ALTER TABLE trainee_profiles ADD COLUMN neck_circumference numeric(5,1);
    RAISE NOTICE 'Added neck_circumference column';
  END IF;

  -- Add arm circumference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainee_profiles' AND column_name = 'arm_circumference'
  ) THEN
    ALTER TABLE trainee_profiles ADD COLUMN arm_circumference numeric(5,1);
    RAISE NOTICE 'Added arm_circumference column';
  END IF;

  -- Add chest circumference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainee_profiles' AND column_name = 'chest_circumference'
  ) THEN
    ALTER TABLE trainee_profiles ADD COLUMN chest_circumference numeric(5,1);
    RAISE NOTICE 'Added chest_circumference column';
  END IF;

  -- Add thigh circumference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainee_profiles' AND column_name = 'thigh_circumference'
  ) THEN
    ALTER TABLE trainee_profiles ADD COLUMN thigh_circumference numeric(5,1);
    RAISE NOTICE 'Added thigh_circumference column';
  END IF;

  -- Add calf circumference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainee_profiles' AND column_name = 'calf_circumference'
  ) THEN
    ALTER TABLE trainee_profiles ADD COLUMN calf_circumference numeric(5,1);
    RAISE NOTICE 'Added calf_circumference column';
  END IF;

  -- Add age column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'trainee_profiles' AND column_name = 'age'
  ) THEN
    ALTER TABLE trainee_profiles ADD COLUMN age integer;
    RAISE NOTICE 'Added age column';
  END IF;

  -- Update valid_measurements constraint to include new measurements
  -- First drop the existing constraint if it exists
  ALTER TABLE trainee_profiles DROP CONSTRAINT IF EXISTS valid_measurements;

  -- Add new constraint with all measurements
  ALTER TABLE trainee_profiles ADD CONSTRAINT valid_measurements CHECK (
    (initial_weight > 0 OR initial_weight IS NULL) AND
    (current_weight > 0 OR current_weight IS NULL) AND
    (target_weight > 0 OR target_weight IS NULL) AND
    (height > 0 OR height IS NULL) AND
    ((fat_percentage BETWEEN 0 AND 100) OR fat_percentage IS NULL) AND
    ((muscle_mass BETWEEN 0 AND 100) OR muscle_mass IS NULL) AND
    ((waist_circumference > 0) OR waist_circumference IS NULL) AND
    ((neck_circumference > 0) OR neck_circumference IS NULL) AND
    ((arm_circumference > 0) OR arm_circumference IS NULL) AND
    ((chest_circumference > 0) OR chest_circumference IS NULL) AND
    ((thigh_circumference > 0) OR thigh_circumference IS NULL) AND
    ((calf_circumference > 0) OR calf_circumference IS NULL) AND
    ((age > 0) OR age IS NULL)
  );

  RAISE NOTICE 'Updated valid_measurements constraint';
END $$;

-- Insert sample data for existing users
DO $$
DECLARE
  v_trainee_id uuid;
BEGIN
  FOR v_trainee_id IN 
    SELECT id FROM trainee_profiles
  LOOP
    -- Only update if measurements are NULL
    UPDATE trainee_profiles
    SET 
      waist_circumference = CASE WHEN waist_circumference IS NULL THEN 85 + (random() * 20)::numeric(5,1) ELSE waist_circumference END,
      neck_circumference = CASE WHEN neck_circumference IS NULL THEN 35 + (random() * 10)::numeric(5,1) ELSE neck_circumference END,
      arm_circumference = CASE WHEN arm_circumference IS NULL THEN 30 + (random() * 10)::numeric(5,1) ELSE arm_circumference END,
      chest_circumference = CASE WHEN chest_circumference IS NULL THEN 90 + (random() * 20)::numeric(5,1) ELSE chest_circumference END,
      thigh_circumference = CASE WHEN thigh_circumference IS NULL THEN 50 + (random() * 15)::numeric(5,1) ELSE thigh_circumference END,
      calf_circumference = CASE WHEN calf_circumference IS NULL THEN 35 + (random() * 10)::numeric(5,1) ELSE calf_circumference END,
      age = CASE WHEN age IS NULL THEN 20 + (random() * 40)::integer ELSE age END
    WHERE id = v_trainee_id;
  END LOOP;
  
  RAISE NOTICE 'Added sample measurement data for existing users';
END $$;