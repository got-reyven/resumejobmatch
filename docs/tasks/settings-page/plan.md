# Task: Settings Page — Profile Tab

## Goal

Provide authenticated users with a settings page where they can view and edit their profile details (name, avatar), with sub-tab navigation ready for future settings sections.

## Scope

**In scope:**

- Settings page layout with sub-tab navigation (Profile active, others placeholder)
- Profile tab displaying: email (read-only), user type (read-only), name (editable), avatar (editable)
- API endpoint to read and update profile fields
- Avatar upload to Supabase Storage with URL persisted to `profiles.avatar_url`
- Optimistic UI with success/error feedback

**Out of scope:**

- Account deletion (future tab)
- Plan/billing management (future tab)
- Password/auth settings (magic-link only, no password)
- Business organization settings (separate task)

## Dependencies

- `user-management` — completed (profiles table, auth)
- `dashboard` — completed (layout, sidebar)

## Approach

1. Create `GET /api/v1/profile` to return the current user's profile
2. Create `PATCH /api/v1/profile` to update `full_name`
3. Create `POST /api/v1/profile/avatar` to upload avatar to Supabase Storage and update `avatar_url`
4. Build settings page with Tabs component: Profile (active), Plan, Account (coming soon placeholders)
5. Profile tab shows a form with name input and avatar upload/preview

## Acceptance Criteria

- [ ] Settings page accessible at /dashboard/settings
- [ ] Profile tab displays email and user type as read-only info
- [ ] Users can edit and save their display name
- [ ] Users can upload an avatar image (JPEG, PNG, WebP; max 2MB)
- [ ] Avatar preview updates immediately after upload
- [ ] Success/error toast feedback on save
- [ ] Sub-tab navigation is present and extensible for future tabs
