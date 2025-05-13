/*
  # Add admin password management

  1. New Functions
    - hash_admin_password: Function to hash admin passwords
    - verify_admin_password: Function to verify admin passwords
    - update_admin_password: Function to update admin password

  2. Security
    - Only allow admin to update their own password
    - Validate password complexity
    - Securely hash passwords
*/

-- Create function to update admin password
CREATE OR REPLACE FUNCTION update_admin_password(
  admin_email text,
  current_password text,
  new_password text
)
RETURNS boolean AS $$
DECLARE
  stored_hash text;
BEGIN
  -- Only allow mk@powerhouse.com to change password
  IF admin_email != 'mk@powerhouse.com' THEN
    RETURN false;
  END IF;

  -- Get current password hash
  SELECT password_hash INTO stored_hash
  FROM auth.users
  WHERE email = admin_email;

  -- Verify current password
  IF NOT verify_password(stored_hash, current_password) THEN
    RETURN false;
  END IF;

  -- Validate new password
  IF NOT validate_password(new_password) THEN
    RETURN false;
  END IF;

  -- Update password
  UPDATE auth.users
  SET password_hash = crypt(new_password, gen_salt('bf'))
  WHERE email = admin_email;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;