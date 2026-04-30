# Task: Skill Transferability Map (#19)

## Goal

Help hiring managers see potential in candidates with adjacent experience by mapping missing skills to related skills the candidate already has, with transferability ratings.

## Scope

**In scope:**

- AI module (schema, prompt, compute) for Skill Transferability Map
- Display component with tier gating (Business Free teaser / Business Pro full)
- Integration into match pipeline (types, persistence, API route, dashboard)
- Homepage InsightsShowcase card activation
- Documentation updates

**Out of scope:**

- Real-time skill taxonomy database
- External API integrations for skill relationships

## Approach

1. Create `src/services/insights/skill-transferability/` module (schema, prompt, compute)
2. Build `SkillTransferabilityDisplay` component with tier gating:
   - Business Free: shows transfer count + top 2 transfers (skill names + transferability level only)
   - Business Pro: full list with rationale and summary
3. Wire into the existing insight pipeline
4. Activate homepage card

## Dependencies

- Existing insight infrastructure (types, match-persistence, API route)
- AI provider abstraction

## Acceptance Criteria

- [ ] AI generates structured skill transferability data from resume + job inputs
- [ ] Business Free users see teaser (count + top 2 skill names with transferability badges)
- [ ] Business Pro users see full transfer list with rationale
- [ ] Insight persists and loads from saved matches
- [ ] Homepage card #19 is active
- [ ] Documentation updated
