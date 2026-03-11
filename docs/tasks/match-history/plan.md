# Task: Match History

## Goal

Allow authenticated users to view, search, and revisit their past match results from the dashboard, with tier-based retention limits.

## Scope

**In scope:**

- Persist match results to DB when authenticated users run matches from the dashboard
- API endpoint to list match history with pagination, search, and sorting
- History page (`/dashboard/history`) with match list, empty state, and search
- Match detail page (`/dashboard/match/[id]`) to re-view full insights for a past match
- Tier-based retention display (Jobseeker Free: 3-day, Business Free: 14-day)
- Soft-delete matches (set `deleted_at` instead of hard delete)

**Out of scope:**

- Share/export results (separate task)
- Score-range filtering (post-MVP polish)
- Batch delete

## Dependencies

- `dashboard` — completed (layout, sidebar, matching page)
- `user-management` — completed (auth, profiles)
- `matching-engine` — completed (insights infrastructure)

## Approach

1. **Persist matches**: Update the dashboard match page to save results (resume, job description, match, insights) to DB after a successful match — reuse the persistence pattern from `/api/v1/matches/claim`
2. **History API**: Create `GET /api/v1/matches` with pagination (`page`, `pageSize`), search (`q`), and sort (`sort=-created_at`)
3. **History page**: Server component that fetches and displays a table/list of past matches with score, date, and resume/job info
4. **Detail page**: Server component at `/dashboard/match/[id]` that loads a match with its insights and renders `DashboardMatchResults`

## Acceptance Criteria

- [ ] Authenticated users' match results are saved to the database automatically
- [ ] GET /api/v1/matches returns paginated match history scoped to the authenticated user
- [ ] /dashboard/history shows a list of past matches with score, resume name, date
- [ ] /dashboard/history shows empty state when no matches exist
- [ ] /dashboard/history supports keyword search
- [ ] Clicking a match row navigates to /dashboard/match/[id] with full insight results
- [ ] Match detail page renders all insights using DashboardMatchResults
- [ ] Users can soft-delete individual matches from history
