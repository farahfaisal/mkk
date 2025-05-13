-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  sets integer NOT NULL,
  reps integer NOT NULL,
  description text,
  video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  calories integer NOT NULL,
  protein decimal NOT NULL,
  carbs decimal NOT NULL,
  fat decimal NOT NULL,
  description text,
  timing text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_alternatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_meal_id uuid REFERENCES meals(id) ON DELETE CASCADE,
  name text NOT NULL,
  calories integer NOT NULL,
  protein decimal NOT NULL,
  carbs decimal NOT NULL,
  fat decimal NOT NULL,
  description text,
  preparation_time text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  weight decimal NOT NULL,
  height decimal NOT NULL,
  fat_percentage decimal,
  muscle_mass decimal,
  target_weight decimal,
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weight_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  weight decimal NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  meal_id uuid REFERENCES meals(id) ON DELETE CASCADE,
  consumed_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trainee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  initial_weight decimal NOT NULL,
  current_weight decimal NOT NULL,
  target_weight decimal NOT NULL,
  height decimal NOT NULL,
  fat_percentage decimal,
  muscle_mass decimal,
  goal text NOT NULL,
  subscription_plan text NOT NULL,
  subscription_start date NOT NULL,
  subscription_end date NOT NULL,
  trainer_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal NOT NULL,
  duration_months integer NOT NULL,
  features jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Create policies for exercises
CREATE POLICY "Everyone can read exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for meals and alternatives
CREATE POLICY "Everyone can read meals"
  ON meals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can read meal alternatives"
  ON meal_alternatives FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user data
CREATE POLICY "Users can read own metrics"
  ON user_metrics FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own metrics"
  ON user_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for weight records
CREATE POLICY "Users can read own weight records"
  ON weight_records FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can insert own weight records"
  ON weight_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for user exercises
CREATE POLICY "Users can manage own exercises"
  ON user_exercises FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for user meals
CREATE POLICY "Users can manage own meals"
  ON user_meals FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for trainee profiles
CREATE POLICY "Users can read own profile"
  ON trainee_profiles FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for memberships
CREATE POLICY "Everyone can read memberships"
  ON memberships FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Create policies for chat messages
CREATE POLICY "Users can read their messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR recipient_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- Create triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_alternatives_updated_at
  BEFORE UPDATE ON meal_alternatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainee_profiles_updated_at
  BEFORE UPDATE ON trainee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX users_auth_id_idx ON users(auth_id);
CREATE INDEX user_metrics_user_id_idx ON user_metrics(user_id);
CREATE INDEX weight_records_user_id_date_idx ON weight_records(user_id, date);
CREATE INDEX user_exercises_user_id_idx ON user_exercises(user_id);
CREATE INDEX user_meals_user_id_idx ON user_meals(user_id);
CREATE INDEX exercises_category_idx ON exercises(category);
CREATE INDEX meals_category_idx ON meals(category);
CREATE INDEX meal_alternatives_original_meal_id_idx ON meal_alternatives(original_meal_id);
CREATE INDEX notifications_recipient_id_idx ON notifications(recipient_id);
CREATE INDEX chat_messages_user_idx ON chat_messages(sender_id, recipient_id);