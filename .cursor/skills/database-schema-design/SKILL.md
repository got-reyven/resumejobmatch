---
name: database-schema-design
description: Designs Supabase PostgreSQL schemas with RLS policies, migrations, proper indexing, and SaaS-ready multi-tenant patterns. Use when creating tables, defining relationships, writing migrations, or setting up Row Level Security.
---

# Database Schema Design

## When to Use

Invoke this skill when:

- Creating new database tables
- Adding columns or relationships to existing tables
- Writing or modifying RLS policies
- Setting up database migrations
- Optimizing queries with indexes

## Design Workflow

```
Task Progress:
- [ ] Step 1: Define the entity and relationships
- [ ] Step 2: Write the SQL migration
- [ ] Step 3: Create RLS policies
- [ ] Step 4: Add indexes for query patterns
- [ ] Step 5: Create Zod schema to match
- [ ] Step 6: Test the policies
```

## Table Design Standards

Every table must include:

```sql
CREATE TABLE resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- domain columns here --
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL  -- soft delete for user data
);

-- Auto-update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
```

### Conventions

| Convention    | Rule                                                    |
| ------------- | ------------------------------------------------------- |
| Primary keys  | UUID via `gen_random_uuid()`                            |
| Naming        | `snake_case` for tables and columns                     |
| Table names   | Plural nouns (`resumes`, `job_listings`)                |
| Foreign keys  | `{singular_table}_id` (e.g., `user_id`, `resume_id`)    |
| Timestamps    | `created_at` + `updated_at` on every table              |
| Soft delete   | `deleted_at` on user-facing data                        |
| Booleans      | Prefix with `is_` or `has_` (`is_active`, `has_parsed`) |
| Status fields | Use PostgreSQL enums or text with CHECK constraint      |
| ON DELETE     | CASCADE for owned data, RESTRICT for references         |

## RLS Policy Patterns

**Always enable RLS before creating policies:**

```sql
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
```

### Standard CRUD Policies (User-Owned Data)

```sql
-- SELECT: Users read only their own data
CREATE POLICY "users_select_own" ON resumes
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can only create data for themselves
CREATE POLICY "users_insert_own" ON resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own data
CREATE POLICY "users_update_own" ON resumes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own data
CREATE POLICY "users_delete_own" ON resumes
  FOR DELETE USING (auth.uid() = user_id);
```

### Shared Data Pattern

```sql
-- Public read, owner write
CREATE POLICY "anyone_select" ON job_listings
  FOR SELECT USING (is_published = true);

CREATE POLICY "owner_manage" ON job_listings
  FOR ALL USING (auth.uid() = created_by);
```

### Service Role Bypass

```sql
-- For server-side operations that need full access (background jobs, admin)
-- Use supabase.auth.admin or service_role key — RLS is bypassed automatically
```

## Indexing Strategy

```sql
-- Always index foreign keys
CREATE INDEX idx_resumes_user_id ON resumes(user_id);

-- Index columns used in WHERE clauses
CREATE INDEX idx_resumes_status ON resumes(status) WHERE deleted_at IS NULL;

-- Index columns used in ORDER BY
CREATE INDEX idx_resumes_created_at ON resumes(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX idx_resumes_user_status ON resumes(user_id, status);
```

**When to index:**

- Foreign keys (always)
- Columns in WHERE clauses used frequently
- Columns in ORDER BY on large tables
- Composite indexes for multi-column filters

**When NOT to index:**

- Small tables (< 1000 rows)
- Columns with low cardinality (booleans) unless in partial index
- Columns rarely queried

## Migration File Naming

```
supabase/migrations/
  20260306000001_create_resumes_table.sql
  20260306000002_add_resumes_rls_policies.sql
  20260306000003_create_job_listings_table.sql
```

Format: `{YYYYMMDD}{sequence}_description.sql`

## Zod Schema Alignment

Database schema and Zod schemas must stay in sync:

```typescript
// src/lib/validations/resume.ts
// Must match database columns (minus server-managed fields)
export const createResumeSchema = z.object({
  title: z.string().min(1).max(200), // VARCHAR(200) NOT NULL
  file_url: z.string().url(), // TEXT NOT NULL
  file_type: z.enum(["pdf", "docx"]), // TEXT CHECK
});
```

## SaaS Multi-Tenant Readiness

- Every table has `user_id` for tenant isolation
- RLS enforces tenant boundaries at the database level
- No cross-tenant queries possible without explicit sharing policies
- Service role key used only for background jobs and admin operations
- Prepare for organization-level tenancy (`org_id`) when team features are added
