# Task: Rewrite Suggestions

## Goal

Give jobseekers concrete, copy-paste-ready rewrites of their experience bullets using the job's language and power verbs, so they can immediately improve their resume for a specific role.

## Scope

**In scope:**

- Zod schema for structured AI output (array of original/suggested/rationale/section)
- AI prompt that rewrites up to 5 experience bullets to match the job description
- Compute function following the standard insight module pattern
- Display component with before/after comparison and tier gating (Free: 1 suggestion, Pro: up to 5)
- Integration into match-persistence registry, insights API route, and DashboardMatchResults
- Activation of the insight card on the homepage InsightsShowcase
- Update tier from 3 (Pro only) to 2 (Free: limited, Pro: full) per user request

**Out of scope:**

- Full resume rewrite (only individual bullets)
- Automatic resume editing/download

## Approach

1. Create schema, prompt, and compute modules under `src/services/insights/rewrite-suggestions/`
2. Add `RewriteSuggestionsData` interface to `src/services/insights/types.ts`
3. Register in `match-persistence.ts` INSIGHT_META and `insights/route.ts` computeMap
4. Build `RewriteSuggestionsDisplay` component with Free/Pro gating
5. Wire into `DashboardMatchResults` as a jobseeker-tab, on-demand generate insight
6. Flip `available: true` and update access on the homepage InsightsShowcase card

## Dependencies

- matching-engine (done)
- tailored-summary (done — same tab/pattern)

## Acceptance Criteria

- [ ] AI generates up to 5 bullet rewrites with original, suggested, rationale, and section
- [ ] Free users see 1 rewrite; Pro users see all (up to 5)
- [ ] Display shows before/after comparison with copy functionality
- [ ] Locked rewrites show upgrade prompt
- [ ] Insight appears in the Jobseeker tab with a "Generate" button
- [ ] Homepage insight card (#13) is marked as available with updated access
- [ ] insights-and-analytics.mdc updated with Implemented status and revised tier
