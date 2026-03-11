# History: Match History

## 2026-03-10 — api-engineer / ui-ux-engineer

- Extracted shared `INSIGHT_META` and persistence logic into `src/services/match-persistence.ts` to DRY up `/api/v1/matches/claim` and the new `/api/v1/matches/save` endpoint
- Refactored `/api/v1/matches/claim/route.ts` to use the shared `persistMatch()` function
- Created `POST /api/v1/matches/save` — identical to claim but used by dashboard match page for authenticated users
- Updated `src/app/dashboard/match/page.tsx` to fire-and-forget save match results to DB after a successful match
- Created `GET /api/v1/matches/history` — paginated list of completed matches with search (job title, company, resume name), scoped to authenticated user via RLS
- Created `GET /api/v1/matches/[id]` — returns full match detail with all insights, resume metadata, and job description
- Created `DELETE /api/v1/matches/[id]` — soft-delete (sets `deleted_at`, filtered from queries)
- Built `/dashboard/history` page with:
  - `useReducer` for state management (follows errors-and-debugging rule for client-side state)
  - Search input with real-time filtering
  - Match count display
  - Paginated list with score, resume name, job title, date
  - Score color coding (green ≥75%, amber ≥50%, red <50%)
  - Empty state with CTA to start first match
  - Delete button with optimistic removal
  - Link to match detail page
- Built `/dashboard/match/[id]` detail page with:
  - Back-to-history navigation
  - Job title, company, resume filename, and date header
  - Full `DashboardMatchResults` component rendering all saved insights
  - Loading, error, and success states
- All files pass lint checks with zero errors
