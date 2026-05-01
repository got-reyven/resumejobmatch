# Task: Salary Range Indicator (#22)

## Goal

Help hiring managers set realistic compensation expectations by estimating a salary range based on the candidate's experience level, skills, seniority, and industry signals.

## Scope

**In scope:**

- AI module (schema, prompt, compute) for Salary Range Indicator
- Display component with tier gating (Business Free teaser / Business Pro full)
- Integration into match pipeline (types, persistence, API route, dashboard)
- Homepage InsightsShowcase card activation
- Documentation updates

**Out of scope:**

- External salary API integrations (Levels.fyi, Glassdoor) — future phase
- Real-time market data feeds

## Approach

1. Create `src/services/insights/salary-range/` module (schema, prompt, compute)
2. Build `SalaryRangeDisplay` component with tier gating:
   - Business Free: shows estimated range (low–high) + confidence level only
   - Business Pro: full range with mid-point, contributing factors, and disclaimer
3. Wire into the existing insight pipeline
4. Activate homepage card

## Dependencies

- Existing insight infrastructure (types, match-persistence, API route)
- AI provider abstraction

## Acceptance Criteria

- [ ] AI generates structured salary range estimate from resume + job inputs
- [ ] Business Free users see teaser (range + confidence badge)
- [ ] Business Pro users see full breakdown with factors
- [ ] Disclaimer always visible ("AI-estimated, not based on real-time market data")
- [ ] Insight persists and loads from saved matches
- [ ] Homepage card #22 is active
- [ ] Documentation updated
