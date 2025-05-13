/*
  # Add role management and update auth

  1. New Functions
    - verify_user_role: Function to verify user role
    - update_user_role: Function to update user role
    - get_user_role: Function to get user role
    
  2. Security
    - Store roles in trainee_profiles table
    - Validate role values
    - Secure role updates
*/

-- Add role column to trainee_profiles
ALTER TABLE trainee_profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'trainee'::text
CHECK (role IN ('admin', 'trainee'));

-- Create index for role column
CREATE INDEX IF NOT EXISTS trainee_profiles_role_idx ON trainee_profiles(role);

-- Create function to verify user role
CREATE OR REPLACE FUNCTION verify_user_role(
  p_user_id uuid,
  p_role text
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trainee_profiles
    WHERE id = p_user_id
    AND role = p_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user role
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id uuid,
  p_new_role text
)
RETURNS void AS $$
BEGIN
  -- Only admin can update roles
  IF NOT EXISTS (
    SELECT 1 FROM trainee_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate role
  IF p_new_role NOT IN ('admin', 'trainee') THEN
    RAISE EXCEPTION 'Invalid role. Must be either "admin" or "trainee"';
  END IF;

  -- Update role
  UPDATE trainee_profiles
  SET role = p_new_role
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(
  p_user_id uuid
)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role
    FROM trainee_profiles
    WHERE id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing admin user
UPDATE trainee_profiles
SET role = 'admin'
WHERE email = 'mk@powerhouse.com';

-- Create policy to allow admin to manage roles
CREATE POLICY "Allow admin to manage roles"
  ON trainee_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trainee_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trainee_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );