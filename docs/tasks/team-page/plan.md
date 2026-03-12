# Task: Team Page (Business Dashboard)

## Goal

Business account owners can view and manage their team members from a dedicated Team page in the dashboard.

## Scope

**In scope:**

- Team page at `/dashboard/team` (business users only)
- Display current team members (owner shown by default)
- Show member name, email, role, status, and join date
- Team sidebar nav item (already exists, business-only)

**Out of scope:**

- Invite team members (Pro feature, post-MVP)
- Remove/deactivate members (post-MVP)
- Role management (post-MVP)

## Approach

1. Create API endpoint `GET /api/v1/organization/members` to fetch team members with profile data
2. Build the Team page UI with a table layout
3. Owner is always the first row, shown even if org_members table is empty (fallback)

## Dependencies

- Business registration flow (done)
- Organization + organization_members tables (done)

## Acceptance Criteria

- [ ] Team page renders at `/dashboard/team`
- [ ] Page shows the account owner as the first team member by default
- [ ] Each member row shows: name/email, role badge, status badge, joined date
- [ ] Non-business users are redirected or see no Team nav item
- [ ] Page handles loading, empty, and error states
