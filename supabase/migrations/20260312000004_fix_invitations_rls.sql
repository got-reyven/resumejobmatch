-- =============================================================================
-- Fix: permission denied for table users on organization_invitations
-- The "invitee_read_own" policy queries auth.users directly, which the
-- authenticated role cannot access. Replace with a SECURITY DEFINER function.
-- =============================================================================

-- 1. Create helper function to get current user's email safely
CREATE OR REPLACE FUNCTION get_auth_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Drop the broken policy
DROP POLICY IF EXISTS "invitee_read_own" ON organization_invitations;

-- 3. Recreate with the safe helper function
CREATE POLICY "invitee_read_own" ON organization_invitations
  FOR SELECT USING (email = get_auth_email());
