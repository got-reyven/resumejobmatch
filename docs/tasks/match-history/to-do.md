# To-Do: Match History

| #   | Sub-task                                         | Assigned To    | Status | Notes                                          |
| --- | ------------------------------------------------ | -------------- | ------ | ---------------------------------------------- |
| 1   | Extract shared match persistence service         | api-engineer   | done   | `src/services/match-persistence.ts`            |
| 2   | Create POST /api/v1/matches/save endpoint        | api-engineer   | done   | Reuses claim validation + persistence service  |
| 3   | Update dashboard match page to auto-save results | ui-ux-engineer | done   | Fire-and-forget POST after successful match    |
| 4   | Create GET /api/v1/matches/history endpoint      | api-engineer   | done   | Pagination, search, sort by created_at desc    |
| 5   | Create GET /api/v1/matches/[id] detail endpoint  | api-engineer   | done   | Returns match + insights + resume/job metadata |
| 6   | Create DELETE /api/v1/matches/[id] endpoint      | api-engineer   | done   | Soft-delete via deleted_at                     |
| 7   | Build /dashboard/history page UI                 | ui-ux-engineer | done   | List, search, empty state, pagination, delete  |
| 8   | Build /dashboard/match/[id] detail page          | ui-ux-engineer | done   | Renders DashboardMatchResults with saved data  |
