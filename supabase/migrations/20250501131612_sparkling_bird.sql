/*
  # Add gender support to trainee profiles

  1. Changes
    - Add gender column to trainee_profiles if it doesn't exist
    - Set default gender to 'male'
    - Update existing records to have a gender value
*/

-- Add gender column to trainee_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'trainee_profiles'
    AND column_name = 'gender'
  ) THEN
    ALTER TABLE trainee_profiles
    ADD COLUMN gender text DEFAULT 'male'::text;
    
    -- Add constraint to ensure valid values
    ALTER TABLE trainee_profiles
    ADD CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other'));
    
    -- Update existing records to have a gender
    UPDATE trainee_profiles
    SET gender = 'male'
    WHERE gender IS NULL;
    
    RAISE NOTICE 'Gender field added to trainee_profiles table';
  ELSE
    RAISE NOTICE 'Gender field already exists in trainee_profiles table';
  END IF;
END $$;