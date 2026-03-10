-- =============================================================================
-- Function to get the total match count across all users (anonymous + registered)
-- Used for the public-facing live counter on the homepage
-- =============================================================================

CREATE OR REPLACE FUNCTION get_total_match_count()
RETURNS BIGINT AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT
    COALESCE((SELECT SUM(match_count) FROM anonymous_usage), 0) +
    COALESCE((SELECT SUM(match_count) FROM usage_tracking), 0)
  INTO total;

  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
