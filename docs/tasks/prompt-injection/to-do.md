# To-Do: Prompt Injection Defense & Resume Integrity Check

| #   | Sub-task                                      | Assigned To  | Status | Notes              |
| --- | --------------------------------------------- | ------------ | ------ | ------------------ |
| 1   | Build prompt injection scanner module         | security-eng | done   |                    |
| 2   | Harden all system prompts (Tier 1)            | ai-engineer  | done   | 14 prompts updated |
| 3   | Create Zod schema for integrity insight       | ai-engineer  | done   |                    |
| 4   | Create prompt builder for integrity insight   | ai-engineer  | done   | Depends on #1      |
| 5   | Create compute function                       | ai-engineer  | done   | Depends on #1, #3  |
| 6   | Add ResumeIntegrityData to types.ts           | api-engineer | done   | Depends on #3      |
| 7   | Register in match-persistence & API route     | api-engineer | done   | Depends on #5      |
| 8   | Create ResumeIntegrityDisplay component       | ui-engineer  | done   | Depends on #3      |
| 9   | Wire into DashboardMatchResults               | ui-engineer  | done   | Depends on #7, #8  |
| 10  | Add #24 card to InsightsShowcase              | ui-engineer  | done   |                    |
| 11  | Update insights-and-analytics.mdc & task docs | product-mgr  | done   | Depends on #9      |
