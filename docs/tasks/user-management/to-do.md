# To-Do: User Management

| #   | Sub-task                                                         | Assigned To       | Status  | Notes                                                        |
| --- | ---------------------------------------------------------------- | ----------------- | ------- | ------------------------------------------------------------ |
| 1   | Update PROJECT-SCOPE.md (sections 2, 4, 5.1, new 5.x, section 8) | product-manager   | done    | Two user types, separate pricing, magic link auth, org model |
| 2   | Write migration `20260309000001_user_management.sql`             | architect         | done    | New enums, tables, RLS, indexes                              |
| 3   | Update database-schema-design SKILL.md                           | architect         | done    | Add org-level tenancy pattern                                |
| 4   | Restructure RATE_LIMITS in `app.ts`                              | api-engineer      | done    | Per-user-type pricing                                        |
| 5   | Fix `user_tier` enum in initial migration                        | architect         | done    | 'lifetime' → 'pro'                                           |
| 6   | Remove BYOAK concept, finalize pricing ($19 JS, $149 Biz)        | product-manager   | done    | All docs, code, SQL updated                                  |
| 7   | Update registration flow in PROJECT-SCOPE.md                     | product-manager   | done    | 5-step flow with plan selection                              |
| 8   | Create auth layout for registration pages                        | ui-ux-engineer    | done    | /register/layout.tsx                                         |
| 9   | Build /register page (user type + email)                         | ui-ux-engineer    | done    | Step 1: choose JS/Biz + enter email                          |
| 10  | Build /register/confirm page                                     | ui-ux-engineer    | done    | Step 2: check your email                                     |
| 11  | Build /auth/callback route handler                               | security-engineer | done    | Step 3: exchange code for session                            |
| 12  | Build /register/plan page                                        | ui-ux-engineer    | done    | Step 4: choose Free/Pro                                      |
| 13  | Wire Supabase signInWithOtp                                      | api-engineer      | done    | Magic link sending                                           |
| 14  | Implement Business invitation flow                               | api-engineer      | pending | Supabase native invite, accept flow                          |
| 15  | Build Jobseeker dashboard                                        | ui-ux-engineer    | pending | JS+Shared insights only                                      |
| 16  | Build Business dashboard                                         | ui-ux-engineer    | pending | HM+Shared insights, team management                          |
| 17  | Write auth middleware (route protection)                         | security-engineer | pending | Route protection, user type gating                           |
| 18  | Write tests                                                      | qa-engineer       | pending | Auth flows, RLS policies, access control                     |
