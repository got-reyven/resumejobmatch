# To-Do: Settings Page — Profile Tab

| #   | Sub-task                                        | Assigned To    | Status | Notes                                        |
| --- | ----------------------------------------------- | -------------- | ------ | -------------------------------------------- |
| 1   | Create Zod validation schema for profile update | api-engineer   | done   | `src/lib/validations/profile.ts`             |
| 2   | Create GET/PATCH /api/v1/profile endpoint       | api-engineer   | done   | Read + update name                           |
| 3   | Create POST /api/v1/profile/avatar endpoint     | api-engineer   | done   | Upload to Supabase Storage                   |
| 4   | Create avatars storage bucket migration         | api-engineer   | done   | Public bucket, 2MB limit, JPEG/PNG/WebP      |
| 5   | Build /dashboard/settings page with Profile tab | ui-ux-engineer | done   | Tabs, avatar upload, name edit, account info |
