# History: Skills Match Breakdown

## 2026-03-08 — Implementation

- Created task documentation (plan, to-do, history)
- Built insight module following established pattern:
  - `schema.ts` — Zod schema with matched (exact/semantic), missing (required/preferred), and coverage_percent
  - `prompt.ts` — AI prompt that extracts skills from JD, cross-references resume skills + experience descriptions
  - `compute.ts` — AI call with resilience wrapper, returns `InsightResult<SkillsBreakdownData>`
- Added `SkillsBreakdownData` to shared types in `types.ts`
- Updated `MatchResult` interface to include `skillsBreakdown` field
- Updated `matching-service.ts` to run both insights in parallel via `Promise.all`
- Built `SkillsBreakdownDisplay` component with:
  - Coverage percentage bar
  - Green matched skills list with exact/semantic badges (semantic shows "≈" notation)
  - Red missing skills list with required/preferred priority indicators
- Replaced `SkillsBreakdownPlaceholder` with real component in both tabs
- Updated `MatchingHero` state to carry both insight results
- All linter checks pass, zero errors
