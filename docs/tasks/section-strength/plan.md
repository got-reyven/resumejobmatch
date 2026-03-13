# Task: Resume Section Strength (Insight #8)

## Goal

Rate each resume section (summary, skills, experience, education, certifications) against a specific job description on a 1–5 scale, identifying the weakest section and providing targeted improvement suggestions.

## Scope

**In scope:**

- AI module (schema, prompt, compute) following the established insight pattern
- Display component with visual score indicators and feedback
- On-demand generation only (registered users, via Generate button in dashboard)
- Registration in INSIGHT_META, computeMap, and DashboardMatchResults

**Out of scope:**

- Public/guest access (Tier 2 — registered users only)
- Automatic computation during matching (on-demand only)

## Approach

1. Create `src/services/insights/section-strength/` module (schema, prompt, compute)
2. Add `SectionStrengthData` to `insights/types.ts`
3. Create `SectionStrengthDisplay.tsx` component
4. Register in `match-persistence.ts` INSIGHT_META, `matches/[id]/insights/route.ts` computeMap
5. Add to `DashboardMatchResults.tsx` using `renderGenerateOrDisplay` pattern

## Acceptance Criteria

- [ ] AI evaluates each resume section (summary, skills, experience, education, certifications) on a 1–5 scale
- [ ] Identifies the weakest section
- [ ] Provides per-section feedback and improvement suggestions
- [ ] Display shows visual score bars/indicators with color coding
- [ ] Available only in dashboard via "Generate" button (jobseeker tab)
- [ ] Persisted to match_insights table on generation
