/*
  # Create trainee profiles and statistics functions

  1. New Tables
    - trainee_profiles
      - Basic info (name, email, phone)
      - Subscription details
      - Physical measurements
      - Status tracking
      - Timestamps

  2. New Functions
    - calculate_revenue(): Calculates total revenue
    - count_new_subscriptions(): Counts recent subscriptions
    - get_admin_stats(): Returns overview statistics
    
  3. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create trainee_profiles table
CREATE TABLE IF NOT EXISTS trainee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  password_hash text NOT NULL,
  initial_weight numeric(5,1),
  current_weight numeric(5,1),
  target_weight numeric(5,1),
  height numeric(5,1),
  fat_percentage numeric(5,1),
  muscle_mass numeric(5,1),
  goal text[] DEFAULT ARRAY['weight_loss'],
  subscription_plan text DEFAULT 'basic',
  subscription_start timestamptz DEFAULT now(),
  subscription_end timestamptz DEFAULT now() + interval '30 days',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_subscription_plan CHECK (
    subscription_plan = ANY(ARRAY['basic', 'premium', 'pro'])
  ),
  CONSTRAINT valid_status CHECK (
    status = ANY(ARRAY['active', 'pending', 'inactive'])
  ),
  CONSTRAINT valid_measurements CHECK (
    initial_weight > 0 AND
    current_weight > 0 AND
    target_weight > 0 AND
    height > 0 AND
    fat_percentage BETWEEN 0 AND 100 AND
    muscle_mass BETWEEN 0 AND 100
  )
);

-- Create indexes
CREATE INDEX trainee_profiles_email_idx ON trainee_profiles(email);
CREATE INDEX trainee_profiles_status_idx ON trainee_profiles(status);
CREATE INDEX trainee_profiles_subscription_plan_idx ON trainee_profiles(subscription_plan);

-- Enable RLS
ALTER TABLE trainee_profiles ENABLE ROW LEVEL SECURITY;

-- Create function to calculate total revenue
CREATE OR REPLACE FUNCTION calculate_revenue()
RETURNS numeric AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(
      CASE 
        WHEN subscription_plan = 'basic' THEN 99
        WHEN subscription_plan = 'premium' THEN 199
        WHEN subscription_plan = 'pro' THEN 299
        ELSE 0
      END
    ), 0)
    FROM trainee_profiles
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to count new subscriptions
CREATE OR REPLACE FUNCTION count_new_subscriptions(days integer DEFAULT 30)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM trainee_profiles
    WHERE created_at >= CURRENT_DATE - days * INTERVAL '1 day'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get admin stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS jsonb AS $$
DECLARE
  total_users integer;
  active_users integer;
  total_revenue numeric;
  new_subs integer;
BEGIN
  -- Get user counts
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active')
  INTO 
    total_users,
    active_users
  FROM trainee_profiles;

  -- Get revenue and new subscriptions
  total_revenue := calculate_revenue();
  new_subs := count_new_subscriptions();

  RETURN jsonb_build_object(
    'totalUsers', total_users,
    'activeUsers', active_users,
    'totalRevenue', total_revenue,
    'newSubscriptions', new_subs
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies
CREATE POLICY "Allow admin full access to trainee_profiles"
  ON trainee_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainees to read own profile"
  ON trainee_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Insert sample trainee
INSERT INTO trainee_profiles (
  name,
  email,
  phone,
  password_hash,
  initial_weight,
  current_weight,
  target_weight,
  height,
  fat_percentage,
  muscle_mass,
  goal,
  subscription_plan,
  status
) VALUES (
  'محمد خلف',
  'mk@powerhouse.com',
  '970 59 123 4567',
  crypt('Admin@123', gen_salt('bf')),
  80,
  75,
  70,
  175,
  18,
  60,
  ARRAY['weight_loss', 'muscle_gain'],
  'premium',
  'active'
) ON CONFLICT DO NOTHING;