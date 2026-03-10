# History: Basic Dashboard

## 2026-03-10 — product-manager

- Created task documentation (plan.md, to-do.md, history.md)
- Dashboard reuses existing matching components from homepage
- Route protection via middleware redirect for unauthenticated users
- Sidebar navigation differentiated by user type

## 2026-03-10 — implementation

- Updated middleware.ts with route protection: unauthenticated users hitting /dashboard/\* are redirected to /auth/login with `next` param
- Built DashboardSidebar component:
  - Logo, nav items (Dashboard, New Match, History, Settings), user info, sign out
  - Business users see additional "Team" nav item
  - User type badge and plan badge displayed
  - Active nav highlighting based on current pathname
- Built dashboard layout (server component):
  - Fetches user profile from Supabase (full_name, user_type)
  - Passes user context to sidebar
  - Mobile header with logo for small screens
- Built dashboard home page (server component):
  - Personalized welcome message with first name
  - "Start a New Match" CTA card
  - Quick action cards: New Match, History, Settings
  - Account info bar showing user type and plan limits
- Built DashboardMatchResults component:
  - Same insight cards as homepage but without login gate
  - Defaults to the tab matching user type (jobseeker/business)
- Built dashboard match page (client component):
  - Reuses ResumeUpload and JobDescriptionInput components
  - No match-once restriction (logged-in users can match multiple times)
  - "Start Over" button to reset and run a new match
  - Full insight results without any login overlay
- All lint checks pass
