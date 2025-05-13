/*
  # Add gender field to trainee_profiles

  1. Changes
    - Add gender column to trainee_profiles table
    - Set default value to 'male'
    - Add constraint to ensure valid values
*/

-- Add gender column to trainee_profiles
ALTER TABLE trainee_profiles
ADD COLUMN IF NOT EXISTS gender text DEFAULT 'male'::text;

-- Add constraint to ensure valid values
ALTER TABLE trainee_profiles
ADD CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other'));

-- Update existing records to have a gender
UPDATE trainee_profiles
SET gender = 'male'
WHERE gender IS NULL;

-- Log the operation
DO $$
BEGIN
  RAISE NOTICE 'Gender field added to trainee_profiles table';
END $$;