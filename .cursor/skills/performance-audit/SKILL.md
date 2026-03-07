---
name: performance-audit
description: Systematic performance review covering Core Web Vitals, bundle size, rendering strategy, data fetching, and caching. Use when auditing page performance, optimizing load times, reducing bundle size, or investigating slow interactions.
---

# Performance Audit

## When to Use

Invoke this skill when:

- Auditing a page or feature for performance
- Investigating slow load times or interactions
- Reviewing bundle size after adding dependencies
- Optimizing data fetching or caching strategies
- Preparing for production launch

## Audit Workflow

```
Task Progress:
- [ ] Step 1: Measure current Core Web Vitals
- [ ] Step 2: Analyze bundle size
- [ ] Step 3: Review rendering strategy
- [ ] Step 4: Audit data fetching patterns
- [ ] Step 5: Check caching layers
- [ ] Step 6: Review asset optimization
- [ ] Step 7: Write findings and recommendations
```

## Step 1: Core Web Vitals Measurement

| Metric | Target  | Measurement                  |
| ------ | ------- | ---------------------------- |
| LCP    | < 2.5s  | Vercel Analytics, Lighthouse |
| INP    | < 200ms | Vercel Analytics             |
| CLS    | < 0.1   | Lighthouse                   |
| TTFB   | < 800ms | Vercel Analytics             |

```bash
# Quick local measurement
npx next build    # Check build output for route sizes
# Then run Lighthouse in Chrome DevTools on each key page
```

## Step 2: Bundle Analysis

```bash
# Install analyzer (one-time)
npm install -D @next/bundle-analyzer

# Run analysis
ANALYZE=true npm run build
```

### Bundle Budget

| Route Type                | Max First-Load JS               |
| ------------------------- | ------------------------------- |
| Landing/public pages      | 80kB                            |
| Dashboard pages           | 100kB                           |
| Complex interactive pages | 120kB (exception, must justify) |

### Common Bundle Bloat

| Issue                                 | Fix                                                            |
| ------------------------------------- | -------------------------------------------------------------- |
| Full icon library imported            | `import { Icon } from "lucide-react"` individually             |
| Large date library                    | Use native `Intl.DateTimeFormat` or `date-fns` (tree-shakable) |
| Unused dependencies                   | Remove from `package.json`, verify with bundle analyzer        |
| Client-side code in server components | Ensure `"use client"` is only where needed                     |
| Large AI SDK in client bundle         | AI calls must be server-only                                   |

## Step 3: Rendering Strategy Review

For each route, verify correct strategy:

| Page Type                  | Strategy     | Implementation                      |
| -------------------------- | ------------ | ----------------------------------- |
| Marketing, docs            | Static (SSG) | No dynamic data fetching at build   |
| Dashboard, user data       | Server (SSR) | Fetch in server components          |
| Real-time interactions     | Client (CSR) | `"use client"` + `useEffect` or SWR |
| Semi-static with user data | ISR          | `revalidate` interval               |

### Checklist

- [ ] No `"use client"` on pages that could be server components
- [ ] Dynamic imports for heavy client components (`next/dynamic`)
- [ ] `loading.tsx` exists for every route with server data fetching
- [ ] No `useEffect` for data that could be fetched server-side

## Step 4: Data Fetching Audit

| Pattern                                      | Status      |
| -------------------------------------------- | ----------- |
| Fetch in server components close to usage    | Required    |
| `React.cache()` for request deduplication    | Required    |
| Select only needed columns from Supabase     | Required    |
| Pagination on all list queries               | Required    |
| No N+1 queries (fetch related data in batch) | Required    |
| `revalidate` set on cached data              | Recommended |
| Streaming with `<Suspense>` for slow queries | Recommended |

### N+1 Query Detection

```typescript
// BAD: N+1 — fetches each resume's skills separately
const resumes = await getResumes(userId);
for (const resume of resumes) {
  resume.skills = await getSkills(resume.id); // N additional queries!
}

// GOOD: Batch fetch with join or separate query
const resumes = await supabase
  .from("resumes")
  .select("*, skills(*)") // Single query with join
  .eq("user_id", userId);
```

## Step 5: Caching Review

```
Layer 1: Browser cache
  → Static assets immutable (Vercel default for _next/static/)
  → next/font self-hosted and cached

Layer 2: CDN / Edge (Vercel)
  → Static pages cached at edge
  → ISR pages cached with revalidation interval
  → API responses: set Cache-Control for public data

Layer 3: Server (React)
  → React.cache() deduplicates within a render
  → fetch() cache with revalidate option
  → unstable_cache for expensive computations

Layer 4: Database
  → Supabase connection pooling (PgBouncer)
  → AI response cache table
```

- [ ] Static assets have immutable cache headers
- [ ] Public data has appropriate Cache-Control
- [ ] No user-specific data cached at CDN layer
- [ ] AI responses cached by input hash
- [ ] Database queries use connection pooling

## Step 6: Asset Optimization

- [ ] All images use `next/image` with explicit dimensions
- [ ] Above-fold images have `priority` prop
- [ ] Fonts loaded via `next/font` (zero CLS)
- [ ] No unoptimized third-party scripts
- [ ] SVG icons inline or via Lucide (no image requests)

## Findings Report Format

```
### Performance Audit: [Page/Feature]

**Current Metrics**:
- LCP: Xs (target: < 2.5s) ✅/❌
- First-load JS: XkB (target: < 100kB) ✅/❌

| # | Finding | Impact | Effort | Priority |
|---|---------|--------|--------|----------|
| 1 | N+1 query in resume list | High | Low | P0 |
| 2 | Missing dynamic import for chart | Medium | Low | P1 |
| 3 | Full date-fns import | Low | Low | P2 |

**Recommendations**: Specific code changes for each finding
**Expected Improvement**: Estimated metric changes after fixes
```
