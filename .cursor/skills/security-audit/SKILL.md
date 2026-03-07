---
name: security-audit
description: Systematic security review process covering OWASP Top 10, Supabase RLS, authentication flows, data privacy, and SaaS compliance. Use when reviewing code for vulnerabilities, implementing auth, handling user data, or preparing for compliance audits.
---

# Security Audit

## When to Use

Invoke this skill when:

- Reviewing code that handles authentication or user data
- Creating or modifying database tables and RLS policies
- Implementing file upload or data export features
- Preparing for a security review or compliance check
- Any change touching secrets, tokens, or API keys

## Audit Workflow

```
Task Progress:
- [ ] Step 1: Authentication & session review
- [ ] Step 2: Authorization & RLS review
- [ ] Step 3: Input validation review
- [ ] Step 4: Data exposure review
- [ ] Step 5: Secret management review
- [ ] Step 6: OWASP Top 10 scan
- [ ] Step 7: Write findings report
```

## Step 1: Authentication Review

| Check              | Pass Criteria                                    |
| ------------------ | ------------------------------------------------ |
| Auth provider      | Supabase Auth (never custom)                     |
| Session validation | `getUser()` server-side on every protected route |
| Token storage      | HTTP-only cookies (Supabase default)             |
| Password policy    | Min 8 chars (Supabase configurable)              |
| OAuth flows        | State parameter validated, PKCE flow             |
| Sign-out           | Token revoked server-side, not just client-side  |

```typescript
// Correct: server-side validation
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
if (!user) throw new AuthenticationError();

// WRONG: client-side only check
const session = await supabase.auth.getSession(); // can be spoofed
```

## Step 2: Authorization & RLS

For every table:

- [ ] RLS is ENABLED (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`)
- [ ] SELECT policy scoped to `auth.uid() = user_id`
- [ ] INSERT policy with CHECK `auth.uid() = user_id`
- [ ] UPDATE policy with USING and WITH CHECK
- [ ] DELETE policy (or soft-delete via UPDATE)
- [ ] No policy grants broader access than intended
- [ ] Service role key only used in server-side code, never exposed to client

## Step 3: Input Validation

| Surface            | Validation                                |
| ------------------ | ----------------------------------------- |
| API request bodies | Zod `.parse()` on every mutating endpoint |
| Query parameters   | Zod schema with defaults and bounds       |
| File uploads       | MIME type + extension + size (max 5MB)    |
| URL parameters     | UUID format validation                    |
| Search queries     | Sanitized, length-limited                 |
| AI prompt inputs   | Truncated to max token budget             |

```typescript
// File upload validation
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFileUpload(file: File) {
  if (!ALLOWED_TYPES.includes(file.type))
    throw new ValidationError("Only PDF and DOCX files are accepted");
  if (file.size > MAX_FILE_SIZE)
    throw new ValidationError("File must be under 5MB");
}
```

## Step 4: Data Exposure Review

- [ ] API responses exclude sensitive fields (`password_hash`, `service_role_key`)
- [ ] Error messages don't leak stack traces, SQL, or internal paths
- [ ] Supabase Storage buckets are **private** (signed URLs for access)
- [ ] Signed URLs have short expiry (max 1 hour)
- [ ] Logs don't contain PII, tokens, or passwords
- [ ] Client-side state doesn't hold more data than the view needs

## Step 5: Secret Management

- [ ] All secrets in `.env` (never in code or version control)
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has placeholder values only
- [ ] Server secrets don't use `NEXT_PUBLIC_` prefix
- [ ] `src/config/env.ts` validates all env vars at startup
- [ ] Supabase service role key only in server-side code

## Step 6: OWASP Top 10 Scan

| OWASP Risk                     | Mitigation                                              |
| ------------------------------ | ------------------------------------------------------- |
| A01: Broken Access Control     | RLS + server-side auth on every route                   |
| A02: Cryptographic Failures    | HTTPS enforced, no custom crypto                        |
| A03: Injection                 | Parameterized queries (Supabase client), Zod validation |
| A04: Insecure Design           | Least privilege, defense in depth                       |
| A05: Security Misconfiguration | Security headers in `next.config.js`, env validation    |
| A06: Vulnerable Components     | `npm audit`, keep dependencies updated                  |
| A07: Auth Failures             | Supabase Auth (battle-tested), rate limiting            |
| A08: Data Integrity            | Input validation, signed uploads                        |
| A09: Logging Failures          | Structured logging without PII                          |
| A10: SSRF                      | No user-controlled URLs in server-side fetches          |

## Security Headers

```javascript
// next.config.js
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
```

## Findings Report Format

```
### Security Audit: [Feature/PR]

**Scope**: What was reviewed
**Risk Level**: Critical / High / Medium / Low

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | Missing RLS on new table | Critical | Must fix |
| 2 | File size not validated | High | Must fix |
| 3 | Verbose error in API | Medium | Should fix |

**Remediation**: Specific code fixes for each finding
**Verification**: Steps to confirm fixes are effective
```
