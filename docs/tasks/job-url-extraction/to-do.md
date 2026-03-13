# To-Do: Job URL Extraction

| #   | Sub-task                                                | Assigned To    | Status | Notes                                             |
| --- | ------------------------------------------------------- | -------------- | ------ | ------------------------------------------------- |
| 1   | Create POST /api/v1/jobs/extract-url endpoint           | api-engineer   | done   | Zod validation, HTML fetch + strip, AI extraction |
| 2   | Create job-extraction-service.ts                        | api-engineer   | done   | URL fetch, HTML→text, AI structured output        |
| 3   | Update JobDescriptionInput URL tab with extraction flow | ui-ux-engineer | done   | Extract button, loading/error/success states      |
| 4   | Wire sourceUrl into MatchingHero                        | ui-ux-engineer | done   | onSourceUrlChange callback, save with match       |
| 5   | Wire sourceUrl into dashboard match page                | ui-ux-engineer | done   | Same pattern as MatchingHero                      |
| 6   | Add jobSourceUrl to claim-match validation schema       | api-engineer   | done   | Optional .url().nullish()                         |
| 7   | Add jobSourceUrl to guest-match-storage                 | api-engineer   | done   | Optional field on GuestMatchData                  |
