# Task: Top Strengths (#4)

## Goal

Give hiring managers a quick "why consider this candidate" summary — the top 3 areas where the candidate strongly meets or exceeds job requirements, backed by resume evidence.

## Scope

**In scope:**

- Insight #4: Top Strengths (schema, prompt, compute)
- Wire into matching service (run parallel with #1, #2, #3)
- TopStrengthsDisplay component with evidence-backed strength cards
- Replace placeholder in MatchResults Business tab

**Out of scope:**

- Candidate ranking across multiple resumes
- Persisting results to database

## Dependencies

- `matching-engine` — completed (insight infrastructure)
- `skills-breakdown` — completed
- `action-items` — completed

## Acceptance Criteria

- [ ] AI identifies top 1–3 strengths backed by specific resume evidence
- [ ] Each strength maps to a job requirement with clear relevance
- [ ] Runs in parallel with other insights
- [ ] Only shown on Business tab
- [ ] Icon displayed in title
