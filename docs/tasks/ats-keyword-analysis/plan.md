# Task: ATS Keyword Analysis (#5)

## Goal

Help jobseekers pass automated ATS (Applicant Tracking System) screening by identifying critical keywords from the job description that are present, semantically matched, or missing in their resume.

## Scope

**In scope:**

- Insight #5: ATS Keyword Analysis (schema, prompt, compute)
- Wire into matching service (run parallel with existing insights)
- ATSKeywordDisplay component with keyword list, categories, and ATS pass likelihood
- Add to Jobseeker tab in MatchResults
- Tier 2 insight: available to registered users (free tier shows top 5 keywords, pro shows full list — gating is UI-level, deferred to tier enforcement task)

**Out of scope:**

- Tier gating UI (blurred/truncated for free tier) — separate task
- Persisting results to database
- ATS scoring integration with third-party tools

## Dependencies

- `matching-engine` — completed (insight infrastructure + overall score)
- `skills-breakdown` — completed (similar pattern to follow)

## Approach

Follow the established insight module pattern:

1. Define Zod output schema in `src/services/insights/ats-keywords/schema.ts`
2. Build prompt functions in `src/services/insights/ats-keywords/prompt.ts`
3. Implement compute function in `src/services/insights/ats-keywords/compute.ts`
4. Add types to `src/services/insights/types.ts` and update `MatchResult`
5. Wire into `matching-service.ts` alongside existing parallel insights
6. Build `ATSKeywordDisplay` component with icon
7. Wire into `MatchResults` (Jobseeker tab) and `MatchingHero`

## Acceptance Criteria

- [ ] AI extracts keywords from job description categorized by type (technical, tool, certification, soft_skill, other)
- [ ] Each keyword is checked against the resume with match status (exact, semantic, missing)
- [ ] Returns an ATS pass likelihood indicator (high, medium, low)
- [ ] Includes a summary suggestion for improvement
- [ ] UI displays keyword list with color-coded match status
- [ ] ATS pass likelihood shown as a prominent indicator
- [ ] Runs in parallel with other insights without performance degradation
- [ ] Component includes required title icon (Search icon, orange-500)
