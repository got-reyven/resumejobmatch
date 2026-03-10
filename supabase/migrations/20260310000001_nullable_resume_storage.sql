-- =============================================================================
-- Allow resumes to exist without a stored file (guest-claimed matches)
-- =============================================================================

ALTER TABLE resumes ALTER COLUMN storage_path DROP NOT NULL;
