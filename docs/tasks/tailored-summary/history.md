# History: Tailored Summary Suggestion (Insight #9)

## 2026-03-16 — Implementation

### What was done

Full end-to-end implementation of Insight #9 (Tailored Summary Suggestion) with tier gating.

**Backend (AI + Service layer):**

- Created `src/services/insights/tailored-summary/schema.ts` — Zod schema: current_summary (nullable), suggested_summary, key_changes array
- Created `src/services/insights/tailored-summary/prompt.ts` — feeds current summary, skills, recent experience, and job description; instructs AI to write 3–4 sentence summary with job-specific keywords
- Created `src/services/insights/tailored-summary/compute.ts` — compute function, tier 2, jobseeker tab, temperature 0.3 for creative writing
- Added `TailoredSummaryData` interface to `src/services/insights/types.ts`

**Frontend (Display + Integration):**

- Created `src/components/features/TailoredSummaryDisplay.tsx`:
  - Teal FileText icon in heading
  - Collapsible "Show current summary" toggle for before/after comparison
  - Suggested summary in teal-bordered card
  - **Tier gating**: Free users see first sentence only + blocked-out remainder + amber upgrade CTA with link to /pricing
  - **Pro users**: Full summary with copy-to-clipboard button
  - Key changes list with checkmarks (blurred for free users)
- Registered in `DashboardMatchResults.tsx` as jobseeker-only insight using `renderGenerateOrDisplay`, passes `isPro` prop
- Registered in `match-persistence.ts` INSIGHT_META (jobseeker, tier 2)
- Registered in `matches/[id]/insights/route.ts` computeMap
- Wired `tailoredSummary` prop through match detail page
- Enabled card on homepage `InsightsShowcase.tsx` (available: true)

### Key decisions

- **Temperature 0.3** — slightly higher than other insights for more natural, creative writing
- **Tier gating at UI layer** — full data is always computed and stored; free users see truncated view
- **First sentence extraction** — uses regex to split at first sentence boundary (`.`, `!`, `?`)
- **Blocked text uses █ characters** — visually indicates hidden content without revealing actual text
- **Key changes also blurred for free** — adds to the upgrade incentive
- **Copy button** — only shown for Pro users who can see the full summary

### Files created

- `src/services/insights/tailored-summary/schema.ts`
- `src/services/insights/tailored-summary/prompt.ts`
- `src/services/insights/tailored-summary/compute.ts`
- `src/components/features/TailoredSummaryDisplay.tsx`

### Files modified

- `src/services/insights/types.ts` — added TailoredSummaryData interface
- `src/services/match-persistence.ts` — added tailoredSummary to INSIGHT_META
- `src/app/api/v1/matches/[id]/insights/route.ts` — added tailoredSummary to computeMap
- `src/components/features/DashboardMatchResults.tsx` — added import, prop, resolution, insight entry with isPro
- `src/app/dashboard/match/[id]/page.tsx` — added type and prop passing
- `src/components/features/InsightsShowcase.tsx` — set available: true for insight #9
