-- FIX: Reset handle_new_user() to a minimal version that works
-- Run this in Supabase Dashboard > SQL Editor

-- First, ensure the profiles table has the basic columns
DO $$
BEGIN
  -- Add user_type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM ('jobseeker', 'business');
  END IF;

  -- Add user_type column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type user_type NOT NULL DEFAULT 'jobseeker';
  END IF;

  -- Add phone column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;

  -- Add location column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
  END IF;
END $$;

-- Recreate the trigger function with safe defaults
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE LOG 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
