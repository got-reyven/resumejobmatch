# Task: Skills Match Breakdown (#2)

## Goal

Show users exactly which skills match and which are missing, with coverage percentage — the most actionable insight for both jobseekers and hiring managers.

## Scope

**In scope:**

- Insight #2: Skills Match Breakdown (schema, prompt, compute)
- Wire into matching service (run parallel with #1)
- SkillsBreakdownDisplay component with matched/missing lists
- Replace placeholder in MatchResults tabs

**Out of scope:**

- ATS keyword analysis (#5) — separate, deeper keyword insight
- Persisting results to database

## Dependencies

- `matching-engine` — completed (insight infrastructure + overall score)

## Acceptance Criteria

- [ ] AI identifies matched skills (exact + semantic) and missing skills (required + preferred)
- [ ] Returns a coverage_percent for quick summary
- [ ] UI shows green matched list and red missing list
- [ ] Semantic matches display with "≈" notation
- [ ] Runs in parallel with overall score for performance
