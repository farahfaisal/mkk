/*
  # Add detailed statistics tracking

  1. New Functions
    - get_detailed_stats(): Returns detailed statistics about users and revenue
    - track_subscription_history(): Tracks subscription plan changes
    - calculate_monthly_revenue(): Calculates revenue by month
*/

-- Create function to get detailed statistics
CREATE OR REPLACE FUNCTION get_detailed_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  subscription_counts jsonb;
  status_counts jsonb;
BEGIN
  -- Get subscription plan distribution
  SELECT jsonb_build_object(
    'basic', COUNT(*) FILTER (WHERE subscription_plan = 'basic'),
    'premium', COUNT(*) FILTER (WHERE subscription_plan = 'premium'),
    'pro', COUNT(*) FILTER (WHERE subscription_plan = 'pro')
  )
  INTO subscription_counts
  FROM trainee_profiles;

  -- Get status distribution
  SELECT jsonb_build_object(
    'active', COUNT(*) FILTER (WHERE status = 'active'),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'inactive', COUNT(*) FILTER (WHERE status = 'inactive')
  )
  INTO status_counts
  FROM trainee_profiles;

  -- Build complete stats object
  stats := jsonb_build_object(
    'totalUsers', (SELECT COUNT(*) FROM trainee_profiles),
    'activeUsers', (SELECT COUNT(*) FROM trainee_profiles WHERE status = 'active'),
    'totalRevenue', calculate_revenue(),
    'newSubscriptions', count_new_subscriptions(),
    'subscriptionDistribution', subscription_counts,
    'statusDistribution', status_counts,
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
    'lastUpdated', CURRENT_TIMESTAMP
  );

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate monthly revenue
CREATE OR REPLACE FUNCTION calculate_monthly_revenue(year int, month int)
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
    WHERE 
      EXTRACT(YEAR FROM created_at) = year AND
      EXTRACT(MONTH FROM created_at) = month
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;