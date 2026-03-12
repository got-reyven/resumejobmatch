# History: Team Member Invitations

## 2026-03-12 — Product Manager

- Created task documentation
- Flow: invite via email → Supabase invite → /accept-invite page → profile setup → dashboard
- Bulk invite up to 10 emails at once

## 2026-03-12 — Agent

- Created 3 API endpoints:
  - `POST /api/v1/organization/invite` — bulk invite using `admin.auth.admin.inviteUserByEmail`, tracks in `organization_invitations`
  - `GET /api/v1/organization/invitations` — returns pending invitations for team table
  - `POST /api/v1/organization/accept-invite` — sets profile (name, user_type=business), creates org membership, marks invitation accepted
- Updated auth callback to detect `invited_to_org` in user metadata → redirect to `/accept-invite`
- Built `/accept-invite` page: shows email + org name (read-only), avatar upload (optional), full name (required)
- Built invite modal on Team page: textarea for bulk emails, validation, per-email result display
- Team table now shows pending invitations below active members with clock icon and yellow "Pending" badge
- Removed Pro badge from Invite Member button — now fully functional
