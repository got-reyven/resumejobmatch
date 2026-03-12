-- =============================================================================
-- DEFINITIVE FIX: Remove auth.users trigger entirely
-- Profile creation is now handled by application code (auth callback route),
-- NOT by database triggers. This guarantees signInWithOtp can never fail
-- from our side.
--
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================================

-- =============================================
-- STEP 1: Remove the trigger that causes "Database error saving new user"
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep the function around (harmless) but make it a no-op
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 2: Make handle_business_signup safe (add exception handler)
-- This only fires on profiles INSERT with user_type = 'business'.
-- With new flow it never fires, but make it safe regardless.
-- =============================================
CREATE OR REPLACE FUNCTION handle_business_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
BEGIN
  IF NEW.user_type != 'business' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM organizations WHERE owner_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  BEGIN
    INSERT INTO organizations (owner_id, name)
    VALUES (NEW.id, 'My Organization')
    RETURNING id INTO v_org_id;

    INSERT INTO organization_members (organization_id, user_id, role, joined_at, status)
    VALUES (v_org_id, NEW.id, 'owner', now(), 'active');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_business_signup: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 3: Fix organizations schema
-- =============================================
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_company_size_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_company_size_check
  CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations'
      AND column_name = 'industry'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE organizations ALTER COLUMN industry TYPE TEXT[] USING
      CASE WHEN industry IS NULL THEN NULL ELSE ARRAY[industry] END;
  END IF;
END $$;

-- =============================================
-- STEP 4: Backfill profiles for any orphaned auth users
-- =============================================
INSERT INTO profiles (id, full_name, avatar_url, user_type)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name'),
  au.raw_user_meta_data ->> 'avatar_url',
  'jobseeker'
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = au.id)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFY: Confirm the trigger is gone
-- =============================================
SELECT tgname, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users'
  AND tgname NOT LIKE 'RI_%';

-- Should return ZERO rows (no custom triggers on auth.users)
