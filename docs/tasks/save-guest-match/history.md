# History: Save Guest Match Results

## 2026-03-10 — Implementation

- Created DB migration `20260310000001_nullable_resume_storage.sql` to make `resumes.storage_path` nullable
- Created `src/lib/guest-match-storage.ts` with `saveGuestMatch`, `getGuestMatch`, `clearGuestMatch` utilities and 24h expiry
- Updated `MatchingHero.tsx` to save match results to localStorage after successful matching
- Created Zod validation schema `src/lib/validations/claim-match.ts` for the claim endpoint
- Created `POST /api/v1/matches/claim` route that persists guest match data (resume, JD, match, insights) into Supabase
- Created `GuestMatchBanner` client component with save/dismiss/success/error states
- Added `GuestMatchBanner` to dashboard home page
- Updated `UnlockMoreCTA` login link to include `?next=/dashboard` for post-auth redirect
