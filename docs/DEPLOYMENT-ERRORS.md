# Deployment Error Log

Errors encountered during Vercel production builds and their fixes.

---

## 1. Unused Function Parameters (`noUnusedParameters`)

**Error:**

```
Type error: 'request' is declared but its value is never read.
```

**Root cause:** `tsconfig.json` has `"noUnusedParameters": true`. Next.js API route handlers require `request` as the first positional argument even when unused (e.g., `GET`, `DELETE` that only use `context.params`).

**Fix:** Prefix unused parameters with an underscore: `_request`.

**Files affected:**

- `src/app/api/v1/matches/[id]/route.ts` — `GET` and `DELETE` handlers

**Prevention:** Always use `_paramName` for required-but-unused route handler parameters.

---

## 2. Supabase Admin Client — Table Types Resolve to `never`

**Error:**

```
Argument of type '{ full_name: string; ... }' is not assignable to parameter of type 'never'.
Property 'email' does not exist on type 'never'.
```

**Root cause:** `src/types/database.ts` contained a placeholder `Record<string, never>` for all tables. The Supabase admin client (`createClient` from `@supabase/supabase-js`) without an explicit `Database` generic caused all `.from()`, `.update()`, `.insert()`, and `.select()` calls to type their results/arguments as `never`.

**Fix:** Explicitly pass `<any>` as the Database generic to `createClient` in `src/lib/supabase/admin.ts` until proper generated types are set up.

```typescript
createClient<any>(url, key, options);
```

**Long-term fix:** Generate real Supabase types with `npx supabase gen types typescript` and apply them to both clients.

**Files affected:**

- `src/lib/supabase/admin.ts`
- `src/app/api/v1/organization/accept-invite/route.ts`
- `src/app/api/v1/organization/invite/route.ts`
- `src/app/api/v1/organization/members/route.ts`
- `src/app/api/v1/profile/route.ts`

---

## 3. Property Name Mismatches Against `ParsedResume` Schema

**Error:**

```
Property 'field' does not exist on type '{ degree: string; field_of_study: string | null; ... }'.
Property 'startDate' does not exist on type '{ start_date: string | null; ... }'.
Property 'graduationDate' does not exist on type '{ year: number | null; ... }'.
```

**Root cause:** Insight prompt builders used camelCase property names (`field`, `startDate`, `endDate`, `graduationDate`) while the `ParsedResume` Zod schema uses snake_case (`field_of_study`, `start_date`, `end_date`, `year`).

**Fix:** Align all property accesses to match the Zod schema's snake_case names.

**Files affected:**

- `src/services/insights/ats-keywords/prompt.ts` — `ed.field` → `ed.field_of_study`
- `src/services/insights/experience-alignment/prompt.ts` — `e.startDate`/`e.endDate` → `e.start_date`/`e.end_date`, `ed.field` → `ed.field_of_study`
- `src/services/insights/qualification-fit/prompt.ts` — `ed.field` → `ed.field_of_study`, `ed.graduationDate` → `ed.year`

**Prevention:** Always reference `src/lib/validations/parsed-resume.ts` for the canonical field names.

---

## 4. Possibly Undefined Values (`noUncheckedIndexedAccess`)

**Error:**

```
Object is possibly 'undefined'.
'availablePlans' is possibly 'undefined'.
'meta' is possibly 'undefined'.
```

**Root cause:** `tsconfig.json` has `"noUncheckedIndexedAccess": true`, which makes any array index or `Record` key access return `T | undefined`.

**Fix:** Use non-null assertion (`!`) after guarded access, or add explicit `undefined` checks.

**Files affected:**

- `src/app/register/business-setup/page.tsx` — `orgs[0]` → `orgs[0]!` (after length check)
- `src/app/register/plan/page.tsx` — `plans[userType]` possibly undefined
- `src/services/match-persistence.ts` — `INSIGHT_META[key]` possibly undefined

**Prevention:** When accessing arrays by index or records by dynamic key, always account for `undefined`.

---

## 5. ESLint `no-console` Warning

**Error:**

```
Warning: Unexpected console statement. no-console
```

**Root cause:** ESLint disallows `console.log` by default.

**Fix:** Use `// eslint-disable-next-line no-console` for intentional server-side logging, or replace with a proper logger.

**Files affected:**

- `src/app/api/v1/organization/invite/route.ts`

---

## 6. `useSearchParams()` Requires Suspense Boundary (Next.js 15)

**Error:**

```
useSearchParams() should be wrapped in a suspense boundary at page "/register".
Error occurred prerendering page "/register".
```

**Root cause:** Next.js 15 prerenders pages during the production build. `useSearchParams()` is asynchronous during static generation and requires a `<Suspense>` boundary so Next.js can defer rendering until search params are available.

**Fix:** Extract the component that calls `useSearchParams()` into a child component and wrap it with `<Suspense>` in the page's default export.

```tsx
export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PageContent /> {/* useSearchParams() lives here */}
    </Suspense>
  );
}
```

**Files affected:**

- `src/app/register/page.tsx`

**Prevention:** Any page or component that calls `useSearchParams()` must be wrapped in a `<Suspense>` boundary. Apply the same pattern whenever adding `useSearchParams()` to a new page.

---

## tsconfig.json Strict Settings Reference

These settings cause most build-time errors. All code must comply:

| Setting                          | Effect                                             |
| -------------------------------- | -------------------------------------------------- |
| `strict: true`                   | Enables all strict type-checking options           |
| `noUnusedLocals: true`           | Errors on declared-but-unused variables            |
| `noUnusedParameters: true`       | Errors on declared-but-unused function parameters  |
| `noUncheckedIndexedAccess: true` | Array/record index access returns `T \| undefined` |
