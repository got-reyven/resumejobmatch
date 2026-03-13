# History: Job URL Extraction

## 2026-03-13 — Implementation

- Created `src/services/job-extraction-service.ts`:
  - Fetches public URL with browser-like User-Agent headers
  - Strips HTML (scripts, styles, nav, footer) to plain text
  - Truncates to 15,000 chars before sending to AI
  - Uses AI structured output (gpt-4o-mini) to extract title, company, location, and full job description
  - Validates result is non-empty; throws descriptive AppError for each failure mode
  - Timeout: 15s, max page size: 2MB
- Created `POST /api/v1/jobs/extract-url` route with Zod URL validation
- Updated `JobDescriptionInput` component:
  - Added "Extract Job Description" button with loading spinner
  - Enter key triggers extraction
  - On success: populates text area, switches to text mode, shows green banner with extracted metadata (title, company, location)
  - On error: shows descriptive error message in red banner
  - Clearing the text area after extraction resets the extracted state
- Added `onSourceUrlChange` callback prop to `JobDescriptionInput`
- Wired `jobSourceUrl` through `MatchingHero` and dashboard match page
- Added `jobSourceUrl` to `claimMatchSchema` validation (`.url().nullish()`)
- Added `jobSourceUrl` to `GuestMatchData` interface
- Both save and claim API routes now pass `jobSourceUrl` to `persistMatch`
- Type-check passes, no linter errors
