-- =============================================================================
-- Resume Job Match — User Management Schema
-- Adds: user types, organizations, org members, org invitations
-- Run this AFTER: 20260307000001_initial_schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. New enum types
-- ---------------------------------------------------------------------------
CREATE TYPE user_type AS ENUM ('jobseeker', 'business');
CREATE TYPE org_role AS ENUM ('owner', 'member');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- ---------------------------------------------------------------------------
-- 2. Fix user_tier enum: rename 'lifetime' → 'pro' (for existing deployments)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'lifetime'
      AND enumtypid = 'user_tier'::regtype
  ) THEN
    ALTER TYPE user_tier RENAME VALUE 'lifetime' TO 'pro';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Extend profiles table
-- ---------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN user_type user_type NOT NULL DEFAULT 'jobseeker',
  ADD COLUMN phone TEXT,
  ADD COLUMN location TEXT;

CREATE INDEX idx_profiles_user_type ON profiles(user_type);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type user_type;
BEGIN
  v_user_type := COALESCE(
    (NEW.raw_user_meta_data ->> 'user_type')::user_type,
    'jobseeker'
  );

  INSERT INTO profiles (id, full_name, avatar_url, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    v_user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 4. Create all tables FIRST (before any cross-table RLS policies)
-- ---------------------------------------------------------------------------

-- 4a. Organizations
CREATE TABLE organizations (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  industry     TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  website      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);

-- 4b. Organization members
CREATE TABLE organization_members (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            org_role NOT NULL DEFAULT 'member',
  invited_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at       TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON organization_members
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);

-- 4c. Organization invitations
CREATE TABLE organization_invitations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            org_role NOT NULL DEFAULT 'member',
  invited_by      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          invitation_status NOT NULL DEFAULT 'pending',
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_org_invitations_org_id ON organization_invitations(organization_id);
CREATE INDEX idx_org_invitations_email ON organization_invitations(email)
  WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- 5. Enable RLS on all new tables
-- ---------------------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 6. RLS policies (all tables exist now, cross-references are safe)
-- ---------------------------------------------------------------------------

-- Organizations: owner has full access
CREATE POLICY "owner_full_access" ON organizations
  FOR ALL USING (auth.uid() = owner_id);

-- Organizations: active members can read
CREATE POLICY "members_can_read" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.status = 'active'
    )
  );

-- Members: active members can read their org's membership list
CREATE POLICY "members_read_own_org" ON organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members AS om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.status = 'active'
    )
  );

-- Members: org owner can manage members
CREATE POLICY "owner_manage_members" ON organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_members.organization_id
        AND organizations.owner_id = auth.uid()
    )
  );

-- Invitations: org owner can manage
CREATE POLICY "owner_manage_invitations" ON organization_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = organization_invitations.organization_id
        AND organizations.owner_id = auth.uid()
    )
  );

-- Invitations: invitee can read their own pending invitations
CREATE POLICY "invitee_read_own" ON organization_invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 7. Extend matches table with optional organization_id
-- ---------------------------------------------------------------------------
ALTER TABLE matches
  ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX idx_matches_org_id ON matches(organization_id)
  WHERE organization_id IS NOT NULL;

DROP POLICY IF EXISTS "users_select_own_matches" ON matches;

CREATE POLICY "users_select_own_or_org_matches" ON matches
  FOR SELECT USING (
    auth.uid() = user_id
    OR (
      organization_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = matches.organization_id
          AND organization_members.user_id = auth.uid()
          AND organization_members.status = 'active'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 8. Helper: auto-create org + owner membership on business signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_business_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_company_name TEXT;
BEGIN
  IF NEW.user_type != 'business' THEN
    RETURN NEW;
  END IF;

  v_company_name := COALESCE(
    (
      SELECT raw_user_meta_data ->> 'company_name'
      FROM auth.users WHERE id = NEW.id
    ),
    NEW.full_name || '''s Organization'
  );

  INSERT INTO organizations (owner_id, name)
  VALUES (NEW.id, v_company_name)
  RETURNING id INTO v_org_id;

  INSERT INTO organization_members (organization_id, user_id, role, joined_at, status)
  VALUES (v_org_id, NEW.id, 'owner', now(), 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_business_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.user_type = 'business')
  EXECUTE FUNCTION handle_business_signup();
