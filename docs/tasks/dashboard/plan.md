# Task: Basic Dashboard

## Goal

Provide authenticated users with a protected dashboard where they can run resume-to-job matching (reusing existing components), view their profile context, and access quick actions — differentiated by user type (Jobseeker vs Business).

## Scope

**In scope:**

- Dashboard layout with sidebar navigation (Dashboard, History, Settings; Business adds Team)
- Route protection — redirect unauthenticated users to `/auth/login`
- Dashboard home page with welcome message, user type badge, and quick actions
- Dashboard matching page reusing `ResumeUpload`, `JobDescriptionInput`, and `MatchResults`
- Logged-in users see full insight results (no "Login to View" gate)
- Sign out functionality

**Out of scope:**

- Match history persistence and listing (separate task)
- Settings page (separate task)
- Team management page (separate task)
- Match detail view (`/dashboard/match/[id]`)
- Rate limiting enforcement

## Dependencies

- `user-management` — completed (auth, profiles, organizations)
- `matching-engine` — completed (insights infrastructure)
- `ats-keyword-analysis` — completed
- Experience Alignment — completed

## Acceptance Criteria

- [ ] Unauthenticated users redirected to `/auth/login` when accessing `/dashboard/*`
- [ ] Dashboard layout with sidebar showing nav items based on user type
- [ ] Dashboard home shows welcome message with user name and type
- [ ] New Match page reuses existing resume upload + job description components
- [ ] Logged-in matching shows all insights without login gate
- [ ] Sign out button in sidebar logs user out and redirects to homepage
