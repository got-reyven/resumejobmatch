# Task: Top 3 Action Items (#3)

## Goal

Turn match analysis into action — give jobseekers the 3 most impactful changes they can make to their resume to boost their match score.

## Scope

**In scope:**

- Insight #3: Top 3 Action Items (schema, prompt, compute)
- Wire into matching service (run parallel with #1 and #2)
- ActionItemsDisplay component with priority, impact, and section targeting
- Replace placeholder in MatchResults Jobseeker tab

**Out of scope:**

- One-click resume editing (future feature)
- Persisting action items to database

## Dependencies

- `matching-engine` — completed (insight infrastructure + overall score)
- `skills-breakdown` — completed (skills gap feeds into recommendations)

## Acceptance Criteria

- [ ] AI generates exactly 3 prioritized action items ranked by impact
- [ ] Each action references a specific resume section to edit
- [ ] Impact levels clearly displayed (high/medium)
- [ ] Runs in parallel with other insights
- [ ] Only shown on Jobseeker tab
