# Task: Overqualification Assessment

## Goal

Help hiring managers identify when a candidate is significantly overqualified for a role, reducing flight-risk mis-hires and enabling better interview preparation.

## Scope

**In scope:**

- Zod schema for structured AI output (is_overqualified, confidence, indicators, recommendation)
- AI prompt that compares candidate seniority, experience depth, and skill level against the role
- Compute function following the standard insight module pattern
- Display component with icon, tier gating (Business Free: full view, Business Pro: full view)
- Integration into match-persistence registry, insights API route, and DashboardMatchResults
- Activation of the insight card on the homepage InsightsShowcase

**Out of scope:**

- Salary-based overqualification signals (covered by #22 Salary Range Indicator)
- Multi-candidate comparison view

## Approach

1. Create schema, prompt, and compute modules under `src/services/insights/overqualification/`
2. Add `OverqualificationData` interface to `src/services/insights/types.ts`
3. Register in `match-persistence.ts` INSIGHT_META and `insights/route.ts` computeMap
4. Build `OverqualificationDisplay` component
5. Wire into `DashboardMatchResults` as a business-tab, on-demand generate insight
6. Flip `available: true` on the homepage InsightsShowcase card

## Dependencies

- matching-engine (done)
- interview-focus (done — same pattern, Hiring Manager / Tier 2)

## Acceptance Criteria

- [ ] AI generates is_overqualified boolean, confidence level, indicators list, and recommendation
- [ ] Display component renders results with appropriate icon and formatting
- [ ] Insight appears in the Business tab with a "Generate" button for registered users
- [ ] Homepage insight card (#12) is marked as available
- [ ] insights-and-analytics.mdc updated with "Implemented" status
