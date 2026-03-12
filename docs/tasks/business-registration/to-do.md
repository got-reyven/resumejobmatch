# To-Do: Business Account Registration

| #   | Sub-task                                                       | Assigned To  | Status      | Notes                                         |
| --- | -------------------------------------------------------------- | ------------ | ----------- | --------------------------------------------- |
| 1   | Fix `handle_new_user` trigger to include `user_type`           | db-migration | in-progress | Broken by migration 20260311000001            |
| 2   | Update `organizations.company_size` CHECK + add missing ranges | db-migration | in-progress | Missing 501-1000, 1001-5000, 5000+            |
| 3   | Pass `user_type` metadata in OTP signup                        | frontend     | in-progress | register/page.tsx                             |
| 4   | Fix business-setup page schema mismatches                      | frontend     | in-progress | employee_range → company_size, industry array |
| 5   | Validate full registration flow                                | qa           | pending     |                                               |
