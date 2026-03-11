-- =============================================================================
-- Fix: infinite recursion in organization_members RLS policy
-- The "members_read_own_org" policy queries organization_members inside its
-- own SELECT policy, causing PostgreSQL error 42P17.
-- Fix: use a SECURITY DEFINER helper function that bypasses RLS.
-- =============================================================================

-- 1. Helper function: check org membership without triggering RLS
CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Fix organization_members: replace self-referencing policy
DROP POLICY IF EXISTS "members_read_own_org" ON organization_members;

CREATE POLICY "members_read_own_org" ON organization_members
  FOR SELECT USING (user_id = auth.uid());

-- 3. Fix organizations: use helper instead of direct subquery
DROP POLICY IF EXISTS "members_can_read" ON organizations;

CREATE POLICY "members_can_read" ON organizations
  FOR SELECT USING (is_org_member(id));

-- 4. Fix matches: use helper instead of direct subquery
DROP POLICY IF EXISTS "users_select_own_or_org_matches" ON matches;

CREATE POLICY "users_select_own_or_org_matches" ON matches
  FOR SELECT USING (
    auth.uid() = user_id
    OR (
      organization_id IS NOT NULL
      AND is_org_member(organization_id)
    )
  );
