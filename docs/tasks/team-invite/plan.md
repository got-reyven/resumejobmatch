# Task: Team Member Invitations

## Goal

Business account owners can invite team members via email. Invited users receive a Supabase invite email, click the link, and land on an accept-invite page where they set up their profile before accessing the dashboard.

## Scope

**In scope:**

- Invite modal on Team page with bulk email input (up to 10)
- POST /api/v1/organization/invite endpoint using Supabase admin `inviteUserByEmail`
- Track invitations in `organization_invitations` table
- `/accept-invite` page: shows email + company name (read-only), asks for full name + avatar
- Auth callback detects invite flow and redirects to `/accept-invite`
- Invited user gets `user_type = 'business'` profile + org membership on completion
- Show pending invitations in team table

**Out of scope:**

- Resend/revoke invitations (post-MVP)
- Role selection during invite (all invited as 'member')
- Team member removal

## Approach

1. API: bulk invite endpoint using `supabase.auth.admin.inviteUserByEmail`
2. Each invite also creates an `organization_invitations` row with status 'pending'
3. Auth callback: detect invite token, redirect to `/accept-invite`
4. Accept-invite page: profile setup form, on submit updates profile + creates org membership + marks invitation accepted
5. Team page: show pending invitations below active members
6. Invite modal: textarea for emails (one per line or comma-separated), validate, submit

## Dependencies

- Team page (done)
- Organization tables + RLS (done)

## Acceptance Criteria

- [ ] Owner can open invite modal and enter up to 10 emails
- [ ] Each email receives a Supabase invite email
- [ ] Clicking the invite link redirects to `/accept-invite`
- [ ] Accept page shows email and company name (read-only)
- [ ] User must enter full name before proceeding
- [ ] Avatar upload is optional
- [ ] On completion, user is added to org as active member
- [ ] Invitation status updates from 'pending' to 'accepted'
- [ ] Team table shows pending invitations
- [ ] Duplicate email invites are prevented
