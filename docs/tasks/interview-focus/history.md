# History: Interview Focus Points

## 2026-03-18 — Implementation

- Created AI module: schema, prompt, compute following the Risk Areas pattern
- Schema: array of questions with question, rationale, category (technical/experience/culture/growth), listen_for
- Prompt: generates 5-10 targeted interview questions based on candidate/job gaps
- Display component: category-coded cards with numbered questions and "Listen for" hints
- Tier gating: Business Free = 3 questions, Business Pro = up to 10 questions (adjusted from original spec)
- Registered in INSIGHT_META (match-persistence.ts), computeMap (insights route), DashboardMatchResults
- Added to match detail page ([id]/page.tsx) for saved match loading
- Marked card as available (id: 11) on homepage InsightsShowcase
- Updated insights-and-analytics.mdc to reflect new tier gating values and implementation status
