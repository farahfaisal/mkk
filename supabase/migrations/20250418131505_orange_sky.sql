/*
  # Create API endpoints management system

  1. New Tables
    - api_endpoints: Stores API endpoint configurations and metadata
    - api_logs: Tracks API usage and performance
    - api_keys: Manages API access keys

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Track API usage and rate limiting

  3. Functions
    - Add API stats to admin dashboard
    - Functions for managing API keys and access
*/

-- Create api_endpoints table
CREATE TABLE IF NOT EXISTS api_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  method text NOT NULL,
  description text,
  requires_auth boolean DEFAULT true,
  rate_limit integer DEFAULT 1000,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Add constraints
  CONSTRAINT valid_http_method CHECK (
    method = ANY(ARRAY['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
  )
);

-- Create api_logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid REFERENCES api_endpoints(id),
  user_id uuid REFERENCES trainee_profiles(id),
  status_code integer NOT NULL,
  response_time integer, -- in milliseconds
  request_ip text,
  request_method text,
  request_path text,
  created_at timestamptz DEFAULT now()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES trainee_profiles(id),
  key_hash text NOT NULL,
  name text NOT NULL,
  enabled boolean DEFAULT true,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX api_endpoints_path_idx ON api_endpoints(path);
CREATE INDEX api_logs_endpoint_id_idx ON api_logs(endpoint_id);
CREATE INDEX api_logs_user_id_idx ON api_logs(user_id);
CREATE INDEX api_logs_created_at_idx ON api_logs(created_at);
CREATE INDEX api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX api_keys_key_hash_idx ON api_keys(key_hash);

-- Enable RLS
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admin full access to api_endpoints"
  ON api_endpoints
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow admin full access to api_logs"
  ON api_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

CREATE POLICY "Allow admin full access to api_keys"
  ON api_keys
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mk@powerhouse.com'
    )
  );

-- Create function to log API request
CREATE OR REPLACE FUNCTION log_api_request(
  p_endpoint_id uuid,
  p_status_code integer,
  p_response_time integer,
  p_request_ip text,
  p_request_method text,
  p_request_path text
)
RETURNS void AS $$
BEGIN
  INSERT INTO api_logs (
    endpoint_id,
    user_id,
    status_code,
    response_time,
    request_ip,
    request_method,
    request_path
  ) VALUES (
    p_endpoint_id,
    auth.uid(),
    p_status_code,
    p_response_time,
    p_request_ip,
    p_request_method,
    p_request_path
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify API key
CREATE OR REPLACE FUNCTION verify_api_key(api_key text)
RETURNS boolean AS $$
DECLARE
  key_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM api_keys
    WHERE key_hash = crypt(api_key, key_hash)
    AND enabled = true
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO key_exists;

  IF key_exists THEN
    UPDATE api_keys
    SET last_used_at = now()
    WHERE key_hash = crypt(api_key, key_hash);
  END IF;

  RETURN key_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key(
  p_name text,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS text AS $$
DECLARE
  v_api_key text;
BEGIN
  -- Generate a random API key
  v_api_key := encode(gen_random_bytes(32), 'hex');

  -- Store the hashed key
  INSERT INTO api_keys (
    user_id,
    key_hash,
    name,
    expires_at
  ) VALUES (
    auth.uid(),
    crypt(v_api_key, gen_salt('bf')),
    p_name,
    p_expires_at
  );

  -- Return the unhashed key (will only be shown once)
  RETURN v_api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_detailed_stats function to include API stats
CREATE OR REPLACE FUNCTION get_detailed_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  api_stats jsonb;
BEGIN
  -- Get API statistics
  SELECT jsonb_build_object(
    'totalEndpoints', (SELECT COUNT(*) FROM api_endpoints),
    'totalRequests', (SELECT COUNT(*) FROM api_logs),
    'averageResponseTime', (
      SELECT ROUND(AVG(response_time)::numeric, 2)
      FROM api_logs
      WHERE created_at > now() - interval '24 hours'
    ),
    'successRate', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300)::numeric / 
        COUNT(*)::numeric * 100), 2
      )
      FROM api_logs
      WHERE created_at > now() - interval '24 hours'
    ),
    'topEndpoints', (
      SELECT jsonb_agg(row_to_json(top_endpoints))
      FROM (
        SELECT 
          e.path,
          COUNT(*) as requests,
          ROUND(AVG(l.response_time)::numeric, 2) as avg_response_time
        FROM api_logs l
        JOIN api_endpoints e ON e.id = l.endpoint_id
        WHERE l.created_at > now() - interval '24 hours'
        GROUP BY e.path
        ORDER BY COUNT(*) DESC
        LIMIT 5
      ) top_endpoints
    )
  )
  INTO api_stats;

  -- Build complete stats object including API stats
  stats := jsonb_build_object(
    'apiStats', api_stats,
    'lastUpdated', CURRENT_TIMESTAMP
  );

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample API endpoints
INSERT INTO api_endpoints (path, method, description) VALUES
-- Admin endpoints
('/admin-api/stats', 'GET', 'Get system statistics'),
('/admin-api/trainees', 'GET', 'Get list of trainees'),
('/admin-api/trainees', 'POST', 'Add new trainee'),
('/admin-api/trainees', 'PUT', 'Update trainee'),
('/admin-api/trainees', 'DELETE', 'Delete trainee'),

-- Exercise endpoints
('/admin-api/exercises', 'GET', 'Get list of exercises'),
('/admin-api/exercises', 'POST', 'Add new exercise'),
('/admin-api/exercises', 'PUT', 'Update exercise'),
('/admin-api/exercises', 'DELETE', 'Delete exercise'),

-- Meal endpoints
('/admin-api/meals', 'GET', 'Get list of meals'),
('/admin-api/meals', 'POST', 'Add new meal'),
('/admin-api/meals', 'PUT', 'Update meal'),
('/admin-api/meals', 'DELETE', 'Delete meal'),

-- Chat endpoints
('/admin-api/chat', 'GET', 'Get chat history'),
('/admin-api/chat', 'POST', 'Send message'),

-- Notification endpoints
('/admin-api/notifications', 'GET', 'Get notifications'),
('/admin-api/notifications', 'POST', 'Send notification'),
('/admin-api/notifications', 'PUT', 'Update notification'),
('/admin-api/notifications', 'DELETE', 'Delete notification'),

-- Membership endpoints
('/admin-api/memberships', 'GET', 'Get memberships'),
('/admin-api/memberships', 'POST', 'Add membership'),
('/admin-api/memberships', 'PUT', 'Update membership'),
('/admin-api/memberships', 'DELETE', 'Delete membership'),

-- Settings endpoints
('/admin-api/settings/general', 'GET', 'Get general settings'),
('/admin-api/settings/general', 'PUT', 'Update general settings'),
('/admin-api/settings/security', 'GET', 'Get security settings'),
('/admin-api/settings/security', 'PUT', 'Update security settings'),
('/admin-api/settings/notifications', 'GET', 'Get notification settings'),
('/admin-api/settings/notifications', 'PUT', 'Update notification settings'),
('/admin-api/settings/appearance', 'GET', 'Get appearance settings'),
('/admin-api/settings/appearance', 'PUT', 'Update appearance settings')
ON CONFLICT DO NOTHING;