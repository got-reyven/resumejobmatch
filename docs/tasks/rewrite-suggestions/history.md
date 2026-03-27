# History: Rewrite Suggestions

## 2026-03-18 — product-manager

- Created task from insights-and-analytics.mdc Insight #13
- User requested tier change: from Tier 3 (Pro only) to Tier 2 (Free: 1 suggestion, Pro: up to 5)
- Defined 9 sub-tasks following the AI Feature Pattern
- Dependencies: matching-engine (done), tailored-summary (done)

## 2026-03-18 — ai-engineer + ui-engineer

- Created `src/services/insights/rewrite-suggestions/schema.ts` — Zod schema with rewrites array (original, suggested, rationale, section), max 5
- Created `src/services/insights/rewrite-suggestions/prompt.ts` — builds system + user prompts focusing on power verbs, job terminology, and quantifiable results
- Created `src/services/insights/rewrite-suggestions/compute.ts` — standard compute function with withAIResilience, maxTokens 2500, temperature 0.3
- Added `RewriteSuggestionsData` interface to `src/services/insights/types.ts`
- Registered `rewriteSuggestions` in `src/services/match-persistence.ts` INSIGHT_META (tab: jobseeker, tier: 2)
- Added `computeRewriteSuggestions` to `src/app/api/v1/matches/[id]/insights/route.ts` computeMap
- Created `src/components/features/RewriteSuggestionsDisplay.tsx` — side-by-side before/after cards, copy button, tier gating (FREE_LIMIT=1), upgrade prompt with Lock/Crown icons
- Wired into `DashboardMatchResults.tsx` as a jobseeker-tab on-demand generate insight
- Passed prop through `src/app/dashboard/match/[id]/page.tsx`
- Activated card #13 in `InsightsShowcase.tsx` (available: true, access: registered)
- Updated `insights-and-analytics.mdc` with Status: Implemented and revised tier info
