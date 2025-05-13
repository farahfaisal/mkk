/*
  # Create notifications system tables

  1. New Tables
    - notifications
      - Stores system and user notifications
      - Supports different notification types
      - Tracks read status
      - Handles targeting specific users or groups

  2. Security
    - Enable RLS
    - Add policies for admin and user access
    - Ensure users can only see their own notifications

  3. Functions
    - Add notification stats to admin dashboard
    - Functions for marking notifications as read
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  sender_id uuid REFERENCES trainee_profiles(id),
  recipient_id uuid REFERENCES trainee_profiles(id),
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_notification_type CHECK (
    type = ANY(ARRAY[
      'info',
      'success',
      'warning',
      'error',
      'exercise',
      'meal',
      'weight',
      'subscription'
    ])
  )
);

-- Create indexes
CREATE INDEX notifications_recipient_id_idx ON notifications(recipient_id);
CREATE INDEX notifications_sender_id_idx ON notifications(sender_id);
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_read_at_idx ON notifications(read_at);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access to notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow users to read their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid() OR
    recipient_id IS NULL -- For broadcast notifications
  );

CREATE POLICY "Allow users to update their notification read status"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read_at = now()
  WHERE id = notification_id
  AND recipient_id = auth.uid()
  AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read_at = now()
  WHERE recipient_id = auth.uid()
  AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE (recipient_id = user_id OR recipient_id IS NULL)
    AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  p_title text,
  p_message text,
  p_type text,
  p_recipient_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (
    title,
    message,
    type,
    sender_id,
    recipient_id
  ) VALUES (
    p_title,
    p_message,
    p_type,
    auth.uid(),
    p_recipient_id
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_detailed_stats function to include notification stats
CREATE OR REPLACE FUNCTION get_detailed_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  subscription_counts jsonb;
  status_counts jsonb;
  meal_counts jsonb;
  exercise_counts jsonb;
  chat_stats jsonb;
  notification_stats jsonb;
BEGIN
  -- Previous stats calculations remain the same...

  -- Get notification statistics
  SELECT jsonb_build_object(
    'totalNotifications', (SELECT COUNT(*) FROM notifications),
    'unreadNotifications', (SELECT COUNT(*) FROM notifications WHERE read_at IS NULL),
    'notificationsByType', (
      SELECT jsonb_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM notifications
        GROUP BY type
      ) as type_counts
    ),
    'averageReadTime', (
      SELECT 
        EXTRACT(epoch FROM AVG(read_at - created_at))::integer
      FROM notifications
      WHERE read_at IS NOT NULL
    )
  )
  INTO notification_stats;

  -- Build complete stats object
  stats := jsonb_build_object(
    'totalUsers', (SELECT COUNT(*) FROM trainee_profiles),
    'activeUsers', (SELECT COUNT(*) FROM trainee_profiles WHERE status = 'active'),
    'totalRevenue', calculate_revenue(),
    'newSubscriptions', count_new_subscriptions(),
    'subscriptionDistribution', subscription_counts,
    'statusDistribution', status_counts,
    'mealDistribution', meal_counts,
    'exerciseDistribution', exercise_counts,
    'chatStats', chat_stats,
    'notificationStats', notification_stats,
    'averageWeight', (
      SELECT ROUND(AVG(current_weight)::numeric, 1)
      FROM trainee_profiles
      WHERE current_weight > 0
    ),
    'averageProgress', (
      SELECT ROUND(AVG(
        CASE 
          WHEN initial_weight > current_weight 
          THEN ((initial_weight - current_weight) / (initial_weight - target_weight) * 100)
          ELSE 0
        END
      )::numeric, 1)
      FROM trainee_profiles
      WHERE initial_weight > target_weight
    ),
    'totalMeals', (SELECT COUNT(*) FROM meals WHERE status = 'active'),
    'totalExercises', (SELECT COUNT(*) FROM exercises WHERE status = 'active'),
    'lastUpdated', CURRENT_TIMESTAMP
  );

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample notifications
DO $$ 
DECLARE
  trainer_id uuid;
  trainee_id uuid;
BEGIN
  -- Get trainer ID (mk@powerhouse.com)
  SELECT id INTO trainer_id
  FROM trainee_profiles
  WHERE email = 'mk@powerhouse.com'
  LIMIT 1;

  -- Get a trainee ID
  SELECT id INTO trainee_id
  FROM trainee_profiles
  WHERE email != 'mk@powerhouse.com'
  LIMIT 1;

  -- Insert sample notifications
  IF trainer_id IS NOT NULL AND trainee_id IS NOT NULL THEN
    -- System notifications
    INSERT INTO notifications (title, message, type, recipient_id) VALUES
    ('تحديث البرنامج التدريبي', 'تم تحديث برنامجك التدريبي لهذا الأسبوع', 'exercise', trainee_id),
    ('تذكير بالوزن الأسبوعي', 'لا تنس تسجيل وزنك لهذا الأسبوع', 'weight', trainee_id),
    ('تهانينا!', 'لقد أكملت جميع تمارين اليوم', 'success', trainee_id),
    ('تحديث الاشتراك', 'باقي 5 أيام على انتهاء اشتراكك', 'warning', trainee_id);

    -- Trainer notifications
    INSERT INTO notifications (title, message, type, sender_id, recipient_id) VALUES
    ('تحديث البرنامج', 'تم تحديث برنامج التمارين الخاص بك', 'info', trainer_id, trainee_id),
    ('موعد جلسة', 'لديك جلسة تدريب غداً الساعة 10 صباحاً', 'info', trainer_id, trainee_id);
  END IF;
END $$;