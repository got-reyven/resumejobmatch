# History: Resume Section Strength (Insight #8)

## 2026-03-13 — Implementation

### What was done

Full end-to-end implementation of Insight #8 (Resume Section Strength), following the on-demand insight pattern.

**Backend (AI + Service layer):**

- Created `src/services/insights/section-strength/schema.ts` — Zod schema with sections array (name, score 1–5, feedback, suggestion) + weakest + summary
- Created `src/services/insights/section-strength/prompt.ts` — evaluates 5 resume sections (summary, skills, experience, education, certifications) against the job description
- Created `src/services/insights/section-strength/compute.ts` — compute function using AI provider with resilience, tier 2, jobseeker tab
- Added `SectionStrengthData` interface to `src/services/insights/types.ts`

**Frontend (Display + Integration):**

- Created `src/components/features/SectionStrengthDisplay.tsx`:
  - Indigo BarChart3 icon in heading
  - Average score summary card
  - Per-section cards with progress bars (green/yellow/red), feedback, and improvement tips
  - Weakest section highlighted with red border and "Needs work" badge
  - Section-specific icons (FileText, Code, Briefcase, GraduationCap, Award)
- Registered in `DashboardMatchResults.tsx` as jobseeker-only insight using `renderGenerateOrDisplay`
- Registered in `match-persistence.ts` INSIGHT_META
- Registered in `matches/[id]/insights/route.ts` computeMap
- Wired `sectionStrength` prop through match detail page

### Key decisions

- **On-demand only** — not computed during matching; users trigger via "Generate" button
- **Jobseeker tab only** — this insight is for jobseekers, not hiring managers
- **Tier 2** — available to registered free users
- **5 fixed sections** — always evaluates summary, skills, experience, education, certifications (even if empty)
- **Score 1 for empty sections** — prompt instructs AI to score missing/empty sections as 1

### Files created

- `src/services/insights/section-strength/schema.ts`
- `src/services/insights/section-strength/prompt.ts`
- `src/services/insights/section-strength/compute.ts`
- `src/components/features/SectionStrengthDisplay.tsx`

### Files modified

- `src/services/insights/types.ts` — added SectionStrengthData interface
- `src/services/match-persistence.ts` — added sectionStrength to INSIGHT_META
- `src/app/api/v1/matches/[id]/insights/route.ts` — added sectionStrength to computeMap
- `src/components/features/DashboardMatchResults.tsx` — added sectionStrength prop, resolution, and insight entry
- `src/app/dashboard/match/[id]/page.tsx` — added SectionStrengthData type and prop passing
