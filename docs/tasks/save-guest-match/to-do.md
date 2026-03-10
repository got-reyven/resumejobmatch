# To-Do: Save Guest Match Results

| #   | Sub-task                                                 | Assigned To    | Status | Notes                                                  |
| --- | -------------------------------------------------------- | -------------- | ------ | ------------------------------------------------------ |
| 1   | DB migration: make `resumes.storage_path` nullable       | api-engineer   | done   | `20260310000001_nullable_resume_storage.sql`           |
| 2   | Save match payload to localStorage in MatchingHero       | ui-ux-engineer | done   | Guest-only, 24h expiry                                 |
| 3   | Create `POST /api/v1/matches/claim` endpoint             | api-engineer   | done   | Zod validation, inserts resume + JD + match + insights |
| 4   | Create `GuestMatchBanner` component on dashboard         | ui-ux-engineer | done   | Save / Dismiss actions, success/error states           |
| 5   | Update CTA login/register links to redirect to dashboard | ui-ux-engineer | done   | `?next=/dashboard` on login link                       |
| 6   | Create task documentation                                | —              | done   |                                                        |
