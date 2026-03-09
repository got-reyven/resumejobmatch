-- =============================================================================
-- Resume Job Match — Initial Database Schema
-- Version: MVP v0.1.0
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "moddatetime";    -- auto-update updated_at triggers

-- ---------------------------------------------------------------------------
-- 2. Custom types
-- ---------------------------------------------------------------------------
CREATE TYPE user_tier AS ENUM ('free', 'pro');
CREATE TYPE match_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE file_type AS ENUM ('pdf', 'docx');
CREATE TYPE insight_tab AS ENUM ('shared', 'jobseeker', 'hiring_manager');

-- ---------------------------------------------------------------------------
-- 3. Profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  tier        user_tier NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. Resumes
-- ---------------------------------------------------------------------------
CREATE TABLE resumes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name    TEXT NOT NULL,
  file_type    file_type NOT NULL,
  file_size    INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 5242880),
  storage_path TEXT NOT NULL,
  raw_text     TEXT,
  parsed_data  JSONB,
  is_parsed    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

CREATE TRIGGER set_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_created_at ON resumes(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_resumes" ON resumes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_resumes" ON resumes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_resumes" ON resumes
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. Job descriptions
-- ---------------------------------------------------------------------------
CREATE TABLE job_descriptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT,
  company     TEXT,
  raw_text    TEXT NOT NULL CHECK (char_length(raw_text) >= 50),
  source_url  TEXT,
  parsed_data JSONB,
  is_parsed   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_job_descriptions_updated_at
  BEFORE UPDATE ON job_descriptions
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE INDEX idx_job_descriptions_user_id ON job_descriptions(user_id);

ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_jobs" ON job_descriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_jobs" ON job_descriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_jobs" ON job_descriptions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_jobs" ON job_descriptions
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6. Matches
-- ---------------------------------------------------------------------------
CREATE TABLE matches (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id          UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_description_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
  overall_score      NUMERIC(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  status             match_status NOT NULL DEFAULT 'pending',
  completed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ
);

CREATE TRIGGER set_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_user_created ON matches(user_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_matches_status ON matches(status)
  WHERE status IN ('pending', 'processing');

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_matches" ON matches
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_matches" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_matches" ON matches
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_matches" ON matches
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 7. Match insights (individual insight results per match)
-- ---------------------------------------------------------------------------
CREATE TABLE match_insights (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id     UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  insight_key  TEXT NOT NULL,
  tab          insight_tab NOT NULL,
  tier         INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  title        TEXT NOT NULL,
  data         JSONB NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, insight_key)
);

CREATE INDEX idx_match_insights_match_id ON match_insights(match_id);

ALTER TABLE match_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_insights" ON match_insights
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM matches WHERE matches.id = match_insights.match_id AND matches.user_id = auth.uid())
  );
CREATE POLICY "users_insert_own_insights" ON match_insights
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM matches WHERE matches.id = match_insights.match_id AND matches.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 8. Shared links (public read-only access to match results)
-- ---------------------------------------------------------------------------
CREATE TABLE shared_links (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id   UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shared_links_token ON shared_links(token);
CREATE INDEX idx_shared_links_match_id ON shared_links(match_id);

ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Owner can manage their shared links
CREATE POLICY "users_manage_own_shared_links" ON shared_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM matches WHERE matches.id = shared_links.match_id AND matches.user_id = auth.uid())
  );
-- Anyone with the token can read (for public shared results page)
CREATE POLICY "anyone_select_by_token" ON shared_links
  FOR SELECT USING (
    (expires_at IS NULL OR expires_at > now())
  );

-- ---------------------------------------------------------------------------
-- 9. Usage tracking (registered users — daily match counts)
-- ---------------------------------------------------------------------------
CREATE TABLE usage_tracking (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  match_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, usage_date)
);

CREATE INDEX idx_usage_tracking_user_date ON usage_tracking(user_id, usage_date);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_upsert_own_usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 10. Anonymous usage (guest rate limiting — no FK to auth)
-- ---------------------------------------------------------------------------
CREATE TABLE anonymous_usage (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash     TEXT NOT NULL,
  usage_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  match_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ip_hash, usage_date)
);

CREATE INDEX idx_anonymous_usage_lookup ON anonymous_usage(ip_hash, usage_date);

-- No RLS — accessed by server via service_role key only
ALTER TABLE anonymous_usage ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 11. AI cache (deduplicate identical AI calls)
-- (Section 11 was previously user_api_keys — removed; BYOAK deferred)
-- ---------------------------------------------------------------------------
CREATE TABLE ai_cache (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  input_hash    TEXT NOT NULL UNIQUE,
  provider      TEXT NOT NULL,
  model         TEXT NOT NULL,
  prompt_key    TEXT NOT NULL,
  response_data JSONB NOT NULL,
  token_usage   JSONB,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_cache_expires_at ON ai_cache(expires_at)
  WHERE expires_at IS NOT NULL;

-- No RLS — accessed by server via service_role key only
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 13. Helper function: increment usage count (upsert pattern)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  IF p_user_id IS NOT NULL THEN
    INSERT INTO usage_tracking (user_id, usage_date, match_count)
    VALUES (p_user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET match_count = usage_tracking.match_count + 1
    RETURNING match_count INTO new_count;
  ELSIF p_ip_hash IS NOT NULL THEN
    INSERT INTO anonymous_usage (ip_hash, usage_date, match_count)
    VALUES (p_ip_hash, CURRENT_DATE, 1)
    ON CONFLICT (ip_hash, usage_date)
    DO UPDATE SET match_count = anonymous_usage.match_count + 1
    RETURNING match_count INTO new_count;
  ELSE
    RAISE EXCEPTION 'Either p_user_id or p_ip_hash must be provided';
  END IF;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 14. Helper function: get current usage count
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_usage_count(
  p_user_id UUID DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  IF p_user_id IS NOT NULL THEN
    SELECT COALESCE(match_count, 0) INTO current_count
    FROM usage_tracking
    WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
  ELSIF p_ip_hash IS NOT NULL THEN
    SELECT COALESCE(match_count, 0) INTO current_count
    FROM anonymous_usage
    WHERE ip_hash = p_ip_hash AND usage_date = CURRENT_DATE;
  END IF;

  RETURN COALESCE(current_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 15. Storage bucket for resume files
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload/read/delete their own files
CREATE POLICY "users_upload_own_resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_read_own_resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_delete_own_resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
