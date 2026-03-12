-- =============================================================================
-- Fix: Business registration flow
-- Strategy: user_type is always 'jobseeker' at signup time. The business-setup
-- page updates user_type to 'business' and creates the organization directly.
-- This avoids trigger failures during the auth.users INSERT transaction.
-- =============================================================================

-- 1. Simplify handle_new_user: always create profile as 'jobseeker'
--    (user_type is never in metadata; business-setup page sets it later)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    'jobseeker'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Make handle_business_signup safe — guard against NULL name and duplicate orgs.
--    This trigger only fires WHEN (NEW.user_type = 'business') on INSERT,
--    which no longer happens (all profiles INSERT as 'jobseeker').
--    Kept as a safety net with robust NULL handling.
CREATE OR REPLACE FUNCTION handle_business_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_company_name TEXT;
  v_email TEXT;
BEGIN
  IF NEW.user_type != 'business' THEN
    RETURN NEW;
  END IF;

  SELECT
    raw_user_meta_data ->> 'company_name',
    email
  INTO v_company_name, v_email
  FROM auth.users WHERE id = NEW.id;

  v_company_name := COALESCE(
    NULLIF(TRIM(v_company_name), ''),
    CASE WHEN TRIM(COALESCE(NEW.full_name, '')) != ''
         THEN TRIM(NEW.full_name) || '''s Organization'
         ELSE NULL END,
    SPLIT_PART(COALESCE(v_email, 'user'), '@', 1) || '''s Organization',
    'My Organization'
  );

  INSERT INTO organizations (owner_id, name)
  VALUES (NEW.id, v_company_name)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_org_id;

  IF v_org_id IS NOT NULL THEN
    INSERT INTO organization_members (organization_id, user_id, role, joined_at, status)
    VALUES (v_org_id, NEW.id, 'owner', now(), 'active');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop and recreate the company_size CHECK constraint to include all ranges
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_company_size_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_company_size_check
  CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'));

-- 4. Change industry from TEXT to TEXT[] to support multi-select
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations'
      AND column_name = 'industry'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE organizations ALTER COLUMN industry TYPE TEXT[] USING
      CASE
        WHEN industry IS NULL THEN NULL
        ELSE ARRAY[industry]
      END;
  END IF;
END $$;
