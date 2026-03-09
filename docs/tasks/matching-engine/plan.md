# Task: Matching Engine — Overall Match Score (#1)

## Goal

Deliver the core matching pipeline so users can upload a resume, paste a job description, and receive an overall match score with dimension breakdown — the anchor metric of the product.

## Scope

**In scope:**

- Insights infrastructure (types, registry pattern)
- Insight #1: Overall Match Score (schema, prompt, compute)
- Matching service orchestrator
- API route: POST /api/v1/matches
- Frontend: trigger matching, display results with score gauge

**Out of scope:**

- Insights #2–#23 (separate tasks)
- Persisting matches to database (future — requires auth)
- Rate limiting (separate task)
- Results sharing / PDF export

## Approach

1. Build the insights type system and registry pattern under `src/services/insights/`
2. Implement insight #1 as the first module following the module pattern
3. Create a matching service that accepts parsed resume + raw job description, runs the pipeline, returns results
4. Expose via API route that accepts the parsed resume + job description text
5. Wire frontend to call the API and render the score

## Dependencies

- `resume-parsing` — completed (parser + AI service exist)
- AI provider infrastructure — completed (OpenAI provider + resilience utils)

## Acceptance Criteria

- [ ] POST /api/v1/matches accepts parsed resume + job description, returns overall score
- [ ] Score includes overall percentage (0–100) and 4 dimension scores
- [ ] Score includes a human-readable summary
- [ ] Frontend triggers matching and displays the score with a ring gauge
- [ ] Error states handled gracefully in both API and UI
- [ ] Follows the insight module pattern from insights-and-analytics rule
