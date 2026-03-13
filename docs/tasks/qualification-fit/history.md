# History: Qualification Fit Insight (#7)

## 2026-03-12 — Implementation

### What was done

Full end-to-end implementation of Insight #7 (Qualification Fit) following the established insight module pattern.

**Backend (AI + Service layer):**

- Created `src/services/insights/qualification-fit/schema.ts` — Zod schema with `qualifications` array (requirement, type, status, evidence, note) + summary
- Created `src/services/insights/qualification-fit/prompt.ts` — prompt template that feeds candidate education, certifications, experience, and skills against job description
- Created `src/services/insights/qualification-fit/compute.ts` — compute function using AI provider with resilience wrapper, tier 2, shared tab
- Added `QualificationFitData` interface to `src/services/insights/types.ts`
- Added `qualificationFit` to `MatchResult` interface
- Integrated `computeQualificationFit` into `src/services/matching-service.ts` (runs in parallel with all other insights via `Promise.all`)

**Frontend (Display + Integration):**

- Created `src/components/features/QualificationFitDisplay.tsx` — display component with:
  - Purple GraduationCap icon in heading
  - Summary counters (Met / Partial / Not found) with color-coded cards
  - Per-qualification cards with status icons (CheckCircle2, AlertCircle, XCircle)
  - Evidence and notes shown contextually
  - Required vs preferred type indicator
  - Empty state when no qualifications extracted
- Added to `DashboardMatchResults.tsx` as a shared insight in the masonry layout
- Added to `MatchResults.tsx` (homepage) in both jobseeker and business tabs
- Added to `MatchingHero.tsx` (homepage matching flow) — state type, result mapping, and prop passing
- Added to `dashboard/match/page.tsx` — state type, result mapping, and prop passing
- Added to `dashboard/match/[id]/page.tsx` — type interface and prop passing

### Key decisions

- Tier set to 2 (matching spec) — UI tier gating deferred until Pro tier is available
- Schema uses `.nullable()` for evidence and note fields (required by OpenAI structured output)
- Prompt explicitly handles "no qualifications" case and "equivalent experience" clauses
- Display component handles empty qualifications array gracefully with summary-only view

### Files created

- `src/services/insights/qualification-fit/schema.ts`
- `src/services/insights/qualification-fit/prompt.ts`
- `src/services/insights/qualification-fit/compute.ts`
- `src/components/features/QualificationFitDisplay.tsx`
- `docs/tasks/qualification-fit/plan.md`
- `docs/tasks/qualification-fit/to-do.md`
- `docs/tasks/qualification-fit/history.md`

### Files modified

- `src/services/insights/types.ts` — added QualificationFitData, updated MatchResult
- `src/services/matching-service.ts` — added computeQualificationFit to Promise.all
- `src/components/features/DashboardMatchResults.tsx` — added qualificationFit prop and insight entry
- `src/components/features/MatchResults.tsx` — added qualificationFit prop and cards in both tabs
- `src/components/features/MatchingHero.tsx` — added type, result mapping, prop passing
- `src/app/dashboard/match/page.tsx` — added type, result mapping, prop passing
- `src/app/dashboard/match/[id]/page.tsx` — added type and prop passing

## 2026-03-13 — Access Control Update

### What was done

Moved Qualification Fit from automatic computation to on-demand generation only.

**Changes:**

- Removed `computeQualificationFit` from `matching-service.ts` `Promise.all` — no longer computed during matching
- Made `qualificationFit` optional in `MatchResult` interface
- Removed QualificationFit from public `MatchResults.tsx` (homepage) entirely
- Removed `qualificationFit` from `MatchingHero.tsx` result type and prop passing
- Removed `qualificationFit` from `dashboard/match/page.tsx` result type
- Added `savedMatchId` tracking to dashboard match page so on-demand generation works for fresh matches
- Dashboard `DashboardMatchResults` already had the `InsightGeneratePrompt` pattern — works as-is

**Result:**

- Public (guest) matching: 6 core insights only (Overall Score, Skills Breakdown, Experience Alignment, ATS Keywords, Action Items, Top Strengths)
- Dashboard (registered): Same 6 core insights auto-computed, Qualification Fit available via "Generate" button
- Future insights follow the same on-demand pattern
