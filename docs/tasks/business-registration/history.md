# History: Business Account Registration

## 2026-03-12 — Agent (attempt 1)

- Diagnosed root cause: `handle_new_user` trigger was overwritten by migration 20260311000001, removing the `user_type` column from the INSERT statement
- Found schema mismatches: business-setup sends `employee_range` but DB column is `company_size`; `industry` sent as array but DB column is `TEXT`
- Registration page does not pass `user_type` in OTP metadata, so trigger can't set it
- Created migration, fixed registration page and business-setup page

## 2026-03-12 — Agent (attempt 2)

- Previous fix still caused 500: passing `data: { user_type }` in `signInWithOtp` metadata triggers `handle_new_user` with `user_type = 'business'`, which fires `handle_business_signup` trigger on INSERT, which fails because `company_name` and `full_name` are both NULL at OTP time
- Added NULL-safe fallback chain in `handle_business_signup` but user still hit errors

## 2026-03-12 — Agent (attempt 3 — architecture change)

- **Root cause**: trigger-based approach is fundamentally flawed for OTP signup — at INSERT time, the user has no profile data yet (no name, no company), so any trigger that depends on metadata will fail
- **New strategy**: decouple user_type from signup entirely
  1. `signInWithOtp` no longer passes `data` — identical to working jobseeker flow
  2. `handle_new_user` trigger always creates profile as `jobseeker` (safe default)
  3. Business-setup page (filled by user post-signup) does the real work:
     - Updates `profiles.user_type` to `'business'`
     - Creates organization + org member rows
  4. `handle_business_signup` trigger kept as safety net but effectively never fires (trigger condition is `WHEN NEW.user_type = 'business'` on INSERT, which never happens)
- Updated: `register/page.tsx`, `register/business-setup/page.tsx`, `api/v1/profile/route.ts`, migration SQL
