# Task: User Management

## Goal

Enable account creation and user management for two user types — **Jobseeker** and **Business** — with magic link authentication, organization model for Business users, and scoped access control.

## Scope

### Included

- Two user types: Jobseeker (personal) and Business (organizational)
- Magic link authentication via Supabase (no passwords)
- Business owner can invite team members via Supabase native invite email
- Organization model: owner creates org, invites members with scoped access
- Separate pricing tiers per user type
- Insight access gating by user type (Jobseeker sees JS+Shared, Business sees HM+Shared)
- Database schema: profiles extension, organizations, org_members, org_invitations
- RLS policies for org-level data access

### Excluded

- Payment integration (Lemon Squeezy) — separate task
- Google OAuth / social login — deferred
- Admin panel for platform-level management
- Email templates customization (uses Supabase defaults)

## Approach

1. Update PROJECT-SCOPE.md with the new user management model
2. Design and write the database migration with RLS policies
3. Update the database-schema-design SKILL with org-level tenancy patterns
4. Update app constants for per-user-type rate limits
5. Implement auth flows, registration pages, and dashboard scoping (implementation phase)

## Acceptance Criteria

- [ ] PROJECT-SCOPE.md documents both user types, separate pricing, magic link auth, and org model
- [ ] Database migration creates: user_type enum, organizations, organization_members, organization_invitations tables
- [ ] RLS policies enforce org-level scoping for business data
- [ ] profiles table extended with user_type, phone, location
- [ ] matches table extended with optional organization_id
- [ ] database-schema-design SKILL.md documents org-level tenancy pattern
- [ ] Rate limits restructured per user type in app constants
- [ ] user_tier enum updated from 'lifetime' to 'pro'
