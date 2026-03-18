# Task: Interview Focus Points (Insight #11)

## Goal

Generate targeted interview questions based on gaps between a candidate's resume and job requirements. Designed for hiring managers to prepare more effective interviews.

## Scope

**In scope:**

- AI module (schema, prompt, compute) following the established insight pattern
- Display component with category-coded question cards
- Tier gating: Business Free sees 3 questions, Business Pro sees up to 10
- On-demand generation only (registered users, via Generate button)
- Registration in all integration points (INSIGHT_META, computeMap, DashboardMatchResults)
- Homepage insights showcase card marked as available

**Out of scope:**

- Public/guest access
- Automatic computation during matching
- Custom question generation or editing

## Approach

Follow the exact same pattern as Risk Areas (#10):

1. Create `src/services/insights/interview-focus/` with schema, prompt, compute
2. Add `InterviewFocusData` type to shared types
3. Create `InterviewFocusDisplay` component with category badges and "listen for" hints
4. Register in INSIGHT_META, computeMap, and DashboardMatchResults
5. Mark card as available on homepage

## Dependencies

- risk-areas (same pattern used as reference)
- matching-engine (provides InsightComputeContext)

## Acceptance Criteria

- [x] AI generates up to 10 interview questions with rationale, category, and listen_for
- [x] Each question categorized as technical, experience, culture, or growth
- [x] Business Free users see 3 questions + upgrade CTA, Business Pro see up to 10
- [x] Available only in dashboard via "Generate" button (business/hiring manager tab)
- [x] Card enabled on homepage insights section
- [x] Registered in INSIGHT_META and API compute map
