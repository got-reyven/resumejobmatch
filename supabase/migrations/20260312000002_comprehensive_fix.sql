-- =============================================================================
-- COMPREHENSIVE FIX: Business Registration
-- Run this ENTIRE file in Supabase Dashboard → SQL Editor
-- =============================================================================

-- =============================================
-- STEP 0: DIAGNOSTIC — see what's currently broken
-- =============================================

-- Show current trigger functions to verify they need fixing
DO $$
BEGIN
  RAISE NOTICE '=== DIAGNOSTIC START ===';
END $$;

-- Check if any orphaned auth users exist without profiles
SELECT
  au.id,
  au.email,
  au.created_at,
  p.id AS profile_id
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- =============================================
-- STEP 1: Fix handle_new_user trigger
-- This is the trigger that fires when auth.users gets a new row.
-- It MUST be simple and NEVER fail. Always defaults to 'jobseeker'.
-- =============================================
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

-- =============================================
-- STEP 2: Fix handle_business_signup trigger
-- This fires AFTER INSERT on profiles WHEN user_type = 'business'.
-- With the new flow, it should NEVER fire (profiles always start as
-- 'jobseeker'). But we make it bulletproof just in case.
-- =============================================
CREATE OR REPLACE FUNCTION handle_business_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_company_name TEXT;
  v_email TEXT;
BEGIN
  -- Safety: exit early if not business
  IF NEW.user_type != 'business' THEN
    RETURN NEW;
  END IF;

  -- Check if org already exists for this user (prevent duplicates)
  IF EXISTS (SELECT 1 FROM organizations WHERE owner_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Get email for fallback org name
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;

  -- Build org name with multiple fallbacks — NEVER NULL
  v_company_name := COALESCE(
    NULLIF(TRIM(COALESCE(
      (SELECT raw_user_meta_data ->> 'company_name' FROM auth.users WHERE id = NEW.id),
      ''
    )), ''),
    CASE
      WHEN TRIM(COALESCE(NEW.full_name, '')) != ''
      THEN TRIM(NEW.full_name) || '''s Organization'
      ELSE NULL
    END,
    CASE
      WHEN v_email IS NOT NULL AND v_email != ''
      THEN SPLIT_PART(v_email, '@', 1) || '''s Organization'
      ELSE NULL
    END,
    'My Organization'
  );

  BEGIN
    INSERT INTO organizations (owner_id, name)
    VALUES (NEW.id, v_company_name)
    RETURNING id INTO v_org_id;

    INSERT INTO organization_members (organization_id, user_id, role, joined_at, status)
    VALUES (v_org_id, NEW.id, 'owner', now(), 'active');
  EXCEPTION WHEN OTHERS THEN
    -- Swallow errors so the profile creation is not rolled back
    RAISE WARNING 'handle_business_signup failed for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 3: Ensure the trigger on auth.users exists and is correct
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- STEP 4: Ensure the trigger on profiles exists and is correct
-- =============================================
DROP TRIGGER IF EXISTS on_business_profile_created ON profiles;
CREATE TRIGGER on_business_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.user_type = 'business')
  EXECUTE FUNCTION handle_business_signup();

-- =============================================
-- STEP 5: Fix organizations schema
-- =============================================

-- Expand company_size CHECK constraint
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_company_size_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_company_size_check
  CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'));

-- Change industry from TEXT to TEXT[] (safe: only runs if still TEXT)
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

-- =============================================
-- STEP 6: Backfill — create profiles for any orphaned auth users
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
-- STEP 7: Clean up any stuck users from previous failed attempts
-- Delete auth users that have no profile and were created in the
-- last 24 hours (these are likely failed registration attempts).
-- This allows the user to re-register with the same email.
-- =============================================
-- NOTE: Uncomment the DELETE below ONLY if you want to clear failed signups.
-- After running it, the user can re-register with the same email.

-- DELETE FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles)
--   AND created_at > now() - interval '24 hours';

-- =============================================
-- DONE — Verify
-- =============================================
SELECT 'SUCCESS: All fixes applied' AS result;

-- Show current triggers on auth.users
SELECT tgname, tgtype, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'auth' AND c.relname = 'users';

-- Show current triggers on profiles
SELECT tgname, tgtype, proname
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'profiles';
