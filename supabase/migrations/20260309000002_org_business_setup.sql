-- =============================================================================
-- Organization Business Setup — multi-industry + employee range
-- =============================================================================

-- Change industry from single TEXT to JSONB array (1–3 industries)
ALTER TABLE organizations
  ALTER COLUMN industry TYPE JSONB USING
    CASE
      WHEN industry IS NOT NULL THEN jsonb_build_array(industry)
      ELSE NULL
    END;

ALTER TABLE organizations
  ADD CONSTRAINT chk_industry_count
    CHECK (
      industry IS NULL
      OR (jsonb_typeof(industry) = 'array' AND jsonb_array_length(industry) BETWEEN 1 AND 3)
    );

-- Rename company_size to employee_range for clarity and tighten the check
ALTER TABLE organizations RENAME COLUMN company_size TO employee_range;

ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_company_size_check;

ALTER TABLE organizations
  ADD CONSTRAINT chk_employee_range
    CHECK (
      employee_range IS NULL
      OR employee_range IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+')
    );
