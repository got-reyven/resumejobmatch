# Task: Business Account Registration

## Goal

Allow users to register as a Business user type, complete the business setup flow (company name, size, industry), and land on the dashboard with the correct user_type and organization.

## Scope

**In scope:**

- Fix the `handle_new_user` trigger to include `user_type` column (broken by migration 20260311000001)
- Pass `user_type` metadata during OTP signup so the trigger sets it correctly
- Fix schema mismatches between business-setup UI and the `organizations` table:
  - `employee_range` → `company_size` column mapping + update CHECK constraint
  - `industry` array → DB column is `TEXT`, needs to be `TEXT[]` or join as string
- Ensure the `handle_business_signup` trigger fires correctly for business users
- Validate the full flow: register → confirm email → plan → business-setup → dashboard

**Out of scope:**

- Pro plan payment integration
- Team member invitations
- Organization settings page

## Approach

1. Create a new SQL migration to fix the trigger and schema issues
2. Update the registration page to pass `user_type` in OTP metadata
3. Fix the business-setup page to match the database schema
4. Validate end-to-end

## Dependencies

- 20260309000001_user_management.sql (organizations table)
- 20260311000001_fix_profile_trigger.sql (broke the user_type in trigger)

## Acceptance Criteria

- [ ] Business user can register via magic link without "Database error"
- [ ] Profile is created with `user_type = 'business'`
- [ ] Organization is auto-created via `handle_business_signup` trigger
- [ ] Business setup page saves company details correctly
- [ ] User lands on dashboard with correct user_type and tier badges
