# History: Top 3 Action Items

## 2026-03-08 — Implementation

- Created task documentation (plan, to-do, history)
- Built insight module following established pattern:
  - `schema.ts` — Zod schema enforcing exactly 3 action items with priority, title, description, section, and impact
  - `prompt.ts` — AI prompt acting as resume coach; analyzes gaps and generates specific, actionable recommendations with concrete wording
  - `compute.ts` — AI call with resilience wrapper, returns `InsightResult<ActionItemsData>`
- Added `ActionItemsData` to shared types in `types.ts`
- Updated `MatchResult` interface to include `actionItems` field
- Updated `matching-service.ts` to run all 3 insights in parallel via `Promise.all`
- Built `ActionItemsDisplay` component with:
  - Numbered priority badges (1/2/3) with visual hierarchy
  - Impact badges (high = green, medium = yellow)
  - Description text explaining why and how
  - Section targeting label showing which resume section to edit
- Replaced `ActionItemsPlaceholder` with real component in Jobseeker tab
- Updated `MatchingHero` state to carry all 3 insight results
- All linter checks pass, zero errors
