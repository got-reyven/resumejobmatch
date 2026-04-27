# Task: Soft Skills Alignment (#16)

## Goal

Help both jobseekers and hiring managers understand how well the candidate's demonstrated soft skills align with the role's requirements — with evidence-backed analysis, not just keyword matching.

## Scope

**In scope:**

- AI module (schema, prompt, compute) for Soft Skills Alignment
- Display component with Free/Pro tier gating
- Integration into match results pipeline
- Homepage insight card activation
- Documentation updates

**Out of scope:**

- Personality assessment or psychometric profiling
- Real-time behavioral analysis

## Approach

1. Create schema, prompt, and compute modules following existing insight patterns
2. Add `SoftSkillsData` type to `types.ts`
3. Build `SoftSkillsDisplay` component with tier gating:
   - **Free**: Coverage percentage + skill list with evidence strength badges (strong/moderate/weak/none) — hooks users by showing _what_ they're missing
   - **Pro**: Full evidence text, improvement suggestions, and detailed breakdown
4. Wire into match-persistence, API route, DashboardMatchResults, and detail page
5. Activate card #16 on homepage
6. Update documentation

## Tier Gating Strategy

- **Free users (Jobseeker Free + Business Free)**: See coverage %, list of all detected soft skills with color-coded evidence strength badges. This is the "hook" — users can see which skills they're weak on but need Pro to learn how to fix it.
- **Pro users**: Full evidence text per skill, actionable improvement suggestions, and complete breakdown.

## Dependencies

- Existing insight module infrastructure
- Anti-injection preamble

## Acceptance Criteria

- [ ] AI correctly identifies soft skills from job description and evidence from resume
- [ ] Free users see coverage + strength badges (teaser)
- [ ] Pro users see full evidence + suggestions
- [ ] Insight appears in both Jobseeker and Business tabs (shared)
- [ ] Card #16 active on homepage
- [ ] Documentation updated
