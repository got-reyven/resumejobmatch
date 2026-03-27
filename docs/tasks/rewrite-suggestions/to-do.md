# To-Do: Rewrite Suggestions

| #   | Sub-task                                   | Assigned To  | Status | Notes             |
| --- | ------------------------------------------ | ------------ | ------ | ----------------- |
| 1   | Create Zod schema                          | ai-engineer  | done   |                   |
| 2   | Create prompt builder                      | ai-engineer  | done   |                   |
| 3   | Create compute function                    | ai-engineer  | done   | Depends on #1, #2 |
| 4   | Add RewriteSuggestionsData to types.ts     | api-engineer | done   | Depends on #1     |
| 5   | Register in match-persistence & API route  | api-engineer | done   | Depends on #3     |
| 6   | Create RewriteSuggestionsDisplay component | ui-engineer  | done   | Depends on #1     |
| 7   | Wire into DashboardMatchResults            | ui-engineer  | done   | Depends on #5, #6 |
| 8   | Activate homepage insight card             | ui-engineer  | done   |                   |
| 9   | Update insights-and-analytics.mdc          | product-mgr  | done   | Depends on #7     |
