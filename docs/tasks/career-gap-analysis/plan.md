# Task: Career Gap Analysis (#17)

## Goal

Help both jobseekers and hiring managers understand employment timeline gaps — with duration, context, and actionable framing — so jobseekers can address concerns proactively and hiring managers can evaluate fairly.

## Scope

**In scope:**

- AI module (schema, prompt, compute) for Career Gap Analysis
- Display component with Free/Pro tier gating
- Integration into match results pipeline
- Homepage insight card activation
- Documentation updates

**Out of scope:**

- Automated gap explanation generation from external data
- Resume editing to fill gaps

## Approach

1. Create schema, prompt, and compute modules following existing insight patterns
2. Add `CareerGapData` type to `types.ts`
3. Build `CareerGapDisplay` component with tier gating:
   - **Free**: Summary, whether significant gaps exist, and total gap count — the hook shows users there's something to worry about
   - **Pro**: Full gap timeline with dates, durations, and possible context/suggestions
4. Wire into match-persistence, API route, DashboardMatchResults, and detail page
5. Activate card #17 on homepage
6. Update documentation

## Dependencies

- Existing insight module infrastructure
- Anti-injection preamble

## Acceptance Criteria

- [ ] AI correctly identifies employment gaps > 3 months from resume timeline
- [ ] Free users see summary + gap count (teaser)
- [ ] Pro users see full gap details with dates and context
- [ ] Insight appears in both Jobseeker and Business tabs (shared)
- [ ] Card #17 active on homepage
- [ ] Documentation updated
