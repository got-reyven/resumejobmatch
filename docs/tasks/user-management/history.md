# History: User Management

## 2026-03-09 — product-manager

- Defined two user types: Jobseeker and Business
- Key decisions: magic link only (no passwords), Supabase native invite for business members, scoped access (members run matches + view org data, only owner manages billing/settings/team), separate pricing per user type
- Created task documentation (plan.md, to-do.md, history.md)

## 2026-03-09 — architect / product-manager

- Updated PROJECT-SCOPE.md:
  - Section 2: rewritten for two concrete user types with registration flows
  - Section 4: separate pricing tables for Jobseeker and Business (prices TBD)
  - Section 5.1: magic link only auth, registration flows, business invitation flow
  - Added Section 5.2: Organizations (auto-create on business signup, roles, access scoping)
  - Renumbered sections 5.3–5.7
  - Section 8: added new routes (register/jobseeker, register/business, accept-invite, team)
  - Section 9: updated MVP scope for magic link + two user types
  - Section 11: added resolved decisions #8–#10
- Wrote migration `20260309000001_user_management.sql`:
  - New enums: user_type, org_role, invitation_status
  - Conditional fix for user_tier enum ('lifetime' → 'pro')
  - Extended profiles with user_type, phone, location
  - Updated handle_new_user() trigger for user_type metadata
  - New tables: organizations, organization_members, organization_invitations
  - Full RLS policies for all new tables
  - Extended matches table with optional organization_id + org-aware RLS
  - Auto-create org + owner membership trigger for business signups
- Updated initial migration: user_tier enum changed from 'lifetime' to 'pro'
- Updated database-schema-design SKILL.md:
  - Added "Organization-Level Tenancy Pattern" section with RLS patterns, invitation flow, auto-create trigger, and conventions
- Restructured RATE_LIMITS in app.ts for per-user-type pricing
- Updated ai-llm-integration-patterns.mdc rate limiting table for two user types
- Updated Pricing.tsx component: Guest card + two plan groups (Jobseeker/Business) with Free + Pro tiers

## 2026-03-09 — product-manager (pricing finalization + BYOAK removal)

- Finalized pricing: Jobseeker Pro at $19/month, Business Pro TBD/month
- Removed BYOAK (Bring Your Own API Key) concept entirely — all AI calls use platform system keys
- Updated files:
  - `Pricing.tsx`: exact feature lists and prices per tier
  - `PROJECT-SCOPE.md`: tier tables, pricing model section, removed §5.7 BYOAK, resolved decisions updated
  - `ai-llm-integration-patterns.mdc`: replaced BYOAK section with simple rate limiting table
  - `data-handling-and-security.mdc`: removed API key encryption section and env var
  - `src/config/env.ts`: removed `API_KEY_ENCRYPTION_SECRET`
  - `src/lib/constants/app.ts`: removed `byoak` rate limit, renamed to `abuseCap`
  - `20260307000001_initial_schema.sql`: removed `user_api_keys` table and `ai_provider` enum
  - `security-compliance.md`: removed BYOAK references from governance checklist
  - `docs/tasks/resume-parsing/plan.md`: updated scope note

## 2026-03-09 — ui-ux-engineer / api-engineer (registration flow implementation)

- Set Business Pro price at $149/month across all docs and Pricing.tsx
- Updated PROJECT-SCOPE.md registration flow to 5-step process with plan selection page
- Updated routes table with new `/register`, `/register/confirm`, `/register/plan`, `/auth/callback`
- Updated Header.tsx Register button to link to `/register`
- Updated Pricing.tsx CTAs to link to `/register?type=jobseeker|business`
- Implemented registration pages:
  - `/register` (layout.tsx + page.tsx): user type selection + email input + Supabase signInWithOtp
  - `/register/confirm` (page.tsx): check-your-email with resend cooldown
  - `/auth/callback` (route.ts): exchange code for session, redirect to plan selection
  - `/register/plan` (page.tsx): choose Free/Pro plan with feature comparison

## 2026-03-09 — ui-ux-engineer / architect (business account setup)

- Fixed handle_new_user() trigger causing 500 on signup (created fix-trigger.sql)
- Added Business Account Setup step at `/register/business-setup`
  - Company Name (required), Employee Range dropdown (required), Industry multi-select 1–3 (required)
  - Saves to organizations table, then redirects to dashboard
- Plan page now redirects business users to business-setup instead of dashboard
- Migration `20260309000002_org_business_setup.sql`:
  - Changed `industry` from TEXT to JSONB array with 1–3 constraint
  - Renamed `company_size` to `employee_range` with expanded ranges
- Updated constants: `src/lib/constants/industries.ts` (32 industries, 7 employee ranges)
- Updated plan page: side-by-side layout, Pro plans marked "Coming Soon"
- Updated PROJECT-SCOPE.md: registration flow, routes table, organizations section
- Updated database-schema-design SKILL.md with organizations table details
