# Task: Industry Jargon Check Insight (#15)

## Goal

Help jobseekers identify and use the right industry-specific vocabulary in their resumes to signal insider knowledge and improve hiring manager perception.

## Scope

**In scope:**

- AI-powered industry identification and terminology extraction
- Per-term presence/absence check against resume
- Suggestions for incorporating missing terms naturally
- Free/Pro tier gating (Free: terms found + 1 suggestion; Pro: all suggestions)
- Display component with pills for found terms and suggestion cards for missing
- Full pipeline integration

**Out of scope:**

- Real-time term database (AI-generated per match)
- Automatic resume rewriting based on jargon

## Approach

1. Create insight module (schema, prompt, compute) under `src/services/insights/industry-jargon/`
2. Build display component with Free/Pro gating
3. Register across the pipeline
4. Activate homepage card

## Dependencies

- matching-engine (done)

## Acceptance Criteria

- [x] AI identifies 8–12 industry-specific terms from job description
- [x] Each term checked for presence in resume
- [x] Missing terms get natural incorporation suggestions
- [x] Free users see all found terms + 1 suggestion; Pro sees all
- [x] Upgrade prompt with amber button for gated content
- [x] Full pipeline integration and homepage activation
- [x] Documentation updated
