# Task: Culture & Communication Indicators (#20)

## Goal

Give hiring managers language-pattern-based indicators of a candidate's working style — collaborative vs. individual, leadership vs. execution, detail-oriented vs. big-picture — based on resume writing analysis.

## Scope

**In scope:**

- AI module (schema, prompt, compute) for Culture & Communication Indicators
- Display component with tier gating (Business Free teaser / Business Pro full)
- Integration into match pipeline (types, persistence, API route, dashboard)
- Homepage InsightsShowcase card activation
- Documentation updates

**Out of scope:**

- Personality assessments or psychometric analysis
- External communication style databases

## Approach

1. Create `src/services/insights/culture-communication/` module (schema, prompt, compute)
2. Build `CultureCommunicationDisplay` component with tier gating:
   - Business Free: communication style summary + dimension names with signal labels
   - Business Pro: full evidence excerpts for each dimension + disclaimer
3. Wire into the existing insight pipeline
4. Activate homepage card

## Dependencies

- Existing insight infrastructure (types, match-persistence, API route)
- AI provider abstraction

## Acceptance Criteria

- [ ] AI generates structured culture/communication data from resume + job inputs
- [ ] Business Free users see teaser (communication style + dimension/signal pairs)
- [ ] Business Pro users see full evidence for each dimension
- [ ] Disclaimer always visible ("indicators from writing style, not a personality assessment")
- [ ] Insight persists and loads from saved matches
- [ ] Homepage card #20 is active
- [ ] Documentation updated
