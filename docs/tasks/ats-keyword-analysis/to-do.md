# To-Do: ATS Keyword Analysis

| #   | Sub-task                              | Status | Notes                                           |
| --- | ------------------------------------- | ------ | ----------------------------------------------- |
| 1   | Create ats-keywords schema            | done   | `src/services/insights/ats-keywords/schema.ts`  |
| 2   | Create ats-keywords prompt            | done   | `src/services/insights/ats-keywords/prompt.ts`  |
| 3   | Create ats-keywords compute           | done   | `src/services/insights/ats-keywords/compute.ts` |
| 4   | Add type + update MatchResult         | done   | `src/services/insights/types.ts`                |
| 5   | Wire into matching service            | done   | Parallel execution via `Promise.all`            |
| 6   | Build ATSKeywordDisplay component     | done   | `src/components/features/ATSKeywordDisplay.tsx` |
| 7   | Wire into MatchResults + MatchingHero | done   | Jobseeker tab, 2-col grid layout                |
