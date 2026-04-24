# History: Industry Jargon Check Insight (#15)

## 2026-03-18 — product-manager

- Created task for Industry Jargon Check (#15) for Jobseeker users
- User requested Free/Pro split: Free gets 1 suggestion, Pro gets all

## 2026-03-18 — implementation

- Created schema, prompt (with anti-injection preamble), and compute under `src/services/insights/industry-jargon/`
- Changed tier from 3 (Pro-only) to 2 (Free + Pro) per user request
- Added `IndustryJargonData` interface to types.ts
- Built `IndustryJargonDisplay` component with:
  - Industry identification banner
  - Coverage count (X of Y terms found)
  - Green pills for found terms
  - Suggestion cards for missing terms (1 for Free, all for Pro)
  - Blurred preview + amber "Upgrade to Pro" button for gated content
- Registered in match-persistence, insights API, DashboardMatchResults, match detail page
- Activated card #15 in InsightsShowcase (access: "registered")
- Updated insights-and-analytics.mdc with new tier and Implemented status
- All 9 sub-tasks completed
