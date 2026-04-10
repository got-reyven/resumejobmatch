# Task: Competitive Positioning Insight (#14)

## Goal

Help Jobseeker Pro users understand how competitively they are positioned for a specific role based on requirement coverage analysis.

## Scope

**In scope:**

- AI-powered competitive positioning estimate (directional, not applicant pool data)
- Strong areas and weak areas identification
- Confidence level and recommendation
- Jobseeker Pro tier gating (Tier 3)
- Display component with positioning banner, strength/gap cards
- Full pipeline integration

**Out of scope:**

- Actual applicant pool comparison (requires external data)
- Salary-linked positioning

## Approach

1. Create insight module (schema, prompt, compute) under `src/services/insights/competitive-positioning/`
2. Build display component with positioning estimate, strong/weak areas grid, recommendation
3. Register in match-persistence, insights API, DashboardMatchResults
4. Activate homepage card

## Dependencies

- matching-engine (done)

## Acceptance Criteria

- [x] Schema matches spec from insights-and-analytics.mdc
- [x] Prompt includes anti-injection preamble
- [x] Compute returns tier 3, tab jobseeker
- [x] Display shows positioning, confidence, strong areas, weak areas, recommendation
- [x] Registered in match-persistence, insights API, DashboardMatchResults, match detail page
- [x] Homepage card #14 is active
- [x] insights-and-analytics.mdc updated with Implemented status
