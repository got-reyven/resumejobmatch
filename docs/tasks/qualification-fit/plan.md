# Task: Qualification Fit Insight (#7)

## Goal

Deliver a clear pass/fail view of a candidate's qualifications (degrees, certifications, clearances) against the job's requirements, enabling jobseekers to see if they meet the bar and hiring managers to quickly filter candidates.

## Scope

**In scope:**

- Zod schema for qualification fit output
- AI prompt template that extracts qualifications from job description and maps them to resume
- Compute function following the existing insight module pattern
- Display component with met/partially_met/not_found visual indicators
- Integration into matching service, dashboard results, homepage results, and match detail pages
- Shared insight (visible to both jobseeker and business tabs)
- Tier 2 gating (Free: summary only, Pro: full breakdown) — applied at UI layer only

**Out of scope:**

- Tier gating UI (will be implemented later when Pro tier is available)
- Caching layer (handled separately)

## Approach

Follow the established insight module pattern (same as experience-alignment, ats-keywords, etc.):

1. Create `src/services/insights/qualification-fit/` module (schema, prompt, compute)
2. Add `QualificationFitData` type to `src/services/insights/types.ts`
3. Add to `MatchResult` interface and `matching-service.ts`
4. Create `QualificationFitDisplay` component
5. Wire into all result display surfaces (DashboardMatchResults, MatchResults, MatchingHero, match pages)

## Dependencies

- Matching engine (done)
- AI provider abstraction (done)
- Existing insight infrastructure (done)

## Acceptance Criteria

- [ ] AI extracts required and preferred qualifications from job description
- [ ] Each qualification is flagged as met, partially_met, or not_found
- [ ] Evidence from resume is shown for met/partially_met qualifications
- [ ] Summary sentence is provided
- [ ] Insight appears in both jobseeker and business tabs (shared)
- [ ] Display uses appropriate icons and color coding per status
- [ ] Component renders in masonry layout alongside other insights
- [ ] No lint errors or type errors
