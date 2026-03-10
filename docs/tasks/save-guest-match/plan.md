# Task: Save Guest Match Results

## Goal

Allow guest users to persist their homepage match results into their account after logging in or registering, without re-running AI calls (saving tokens and time).

## Scope

- **Included**: localStorage bridge for guest match data, claim API endpoint, dashboard banner, CTA link updates, DB migration
- **Excluded**: Match history page, re-running matches, file re-upload

## Approach

1. After a successful match on the homepage, save the full payload (parsed resume, JD text, all insight data, file metadata) to `localStorage` under `guest_match_result`
2. When the user logs in and lands on the dashboard, detect the saved data and show a banner with "Save to Account" / "Dismiss" actions
3. The "Save to Account" action calls `POST /api/v1/matches/claim`, which inserts the resume, job description, match, and match_insights records into Supabase
4. Data expires after 24 hours client-side to prevent stale accumulation

## Acceptance Criteria

- [x] Guest match results are saved to localStorage after matching
- [x] Dashboard shows a banner when unsaved guest data exists
- [x] "Save to Account" persists all data (resume, JD, match, insights) to the database
- [x] "Dismiss" clears localStorage without saving
- [x] Data expires after 24 hours
- [x] CTA login link on match results directs to dashboard after auth
- [x] `resumes.storage_path` is nullable for claimed matches
