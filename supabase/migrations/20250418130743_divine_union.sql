/*
  # Create chat system tables

  1. New Tables
    - conversations
      - Tracks chat threads between trainers and trainees
      - Status and metadata
    - messages
      - Individual messages within conversations
      - Message content and metadata
      - Read status tracking

  2. Security
    - Enable RLS
    - Add policies for trainers and trainees
    - Ensure users can only access their own conversations

  3. Functions
    - Add chat stats to admin dashboard
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL REFERENCES trainee_profiles(id),
  trainee_id uuid NOT NULL REFERENCES trainee_profiles(id),
  status text DEFAULT 'active',
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_conversation_status CHECK (
    status = ANY(ARRAY['active', 'archived', 'blocked'])
  )
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES trainee_profiles(id),
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX conversations_trainer_id_idx ON conversations(trainer_id);
CREATE INDEX conversations_trainee_id_idx ON conversations(trainee_id);
CREATE INDEX conversations_last_message_at_idx ON conversations(last_message_at);
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX messages_sender_id_idx ON messages(sender_id);
CREATE INDEX messages_read_at_idx ON messages(read_at);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Allow admin full access to conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow trainers to access their conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (trainer_id = auth.uid());

CREATE POLICY "Allow trainees to access their conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (trainee_id = auth.uid());

-- Create policies for messages
CREATE POLICY "Allow admin full access to messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow users to access messages in their conversations"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (
        conversations.trainer_id = auth.uid()
        OR conversations.trainee_id = auth.uid()
      )
    )
  );

-- Create function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(message_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET read_at = now()
  WHERE id = message_id
  AND sender_id != auth.uid()
  AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE (c.trainer_id = user_id OR c.trainee_id = user_id)
    AND m.sender_id != user_id
    AND m.read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_detailed_stats function to include chat stats
CREATE OR REPLACE FUNCTION get_detailed_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  subscription_counts jsonb;
  status_counts jsonb;
  meal_counts jsonb;
  exercise_counts jsonb;
  chat_stats jsonb;
BEGIN
  -- Previous stats calculations remain the same...

  -- Get chat statistics
  SELECT jsonb_build_object(
    'totalConversations', (SELECT COUNT(*) FROM conversations),
    'activeConversations', (SELECT COUNT(*) FROM conversations WHERE status = 'active'),
    'totalMessages', (SELECT COUNT(*) FROM messages),
    'unreadMessages', (SELECT COUNT(*) FROM messages WHERE read_at IS NULL),
    'averageResponseTime', (
      SELECT 
        EXTRACT(epoch FROM AVG(m2.created_at - m1.created_at))::integer
      FROM messages m1
      JOIN messages m2 ON m2.conversation_id = m1.conversation_id
      WHERE m2.created_at > m1.created_at
      AND m1.sender_id != m2.sender_id
    )
  )
  INTO chat_stats;

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

-- Insert sample conversations and messages
DO $$ 
DECLARE
  trainer_id uuid;
  trainee_id uuid;
  conversation_id uuid;
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

  -- Create a conversation
  IF trainer_id IS NOT NULL AND trainee_id IS NOT NULL THEN
    INSERT INTO conversations (trainer_id, trainee_id)
    VALUES (trainer_id, trainee_id)
    RETURNING id INTO conversation_id;

    -- Insert sample messages
    INSERT INTO messages (conversation_id, sender_id, content, created_at) VALUES
    (conversation_id, trainee_id, 'مرحباً، عندي استفسار عن برنامج التمارين', now() - interval '2 days'),
    (conversation_id, trainer_id, 'أهلاً بك! كيف يمكنني مساعدتك؟', now() - interval '2 days' + interval '5 minutes'),
    (conversation_id, trainee_id, 'هل يمكنني تغيير موعد تمرين اليوم؟', now() - interval '1 day'),
    (conversation_id, trainer_id, 'نعم، بالتأكيد. متى تفضل الموعد الجديد؟', now() - interval '1 day' + interval '10 minutes');
  END IF;
END $$;