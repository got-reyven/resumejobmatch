# History: Prompt Injection Defense & Resume Integrity Check

## 2026-03-18 — product-manager

- Created task for prompt injection defense (Tier 1 + Tier 2) and Resume Integrity Check insight (#24)
- User identified real-world attack vector: white-on-white text in PDFs with score inflation instructions
- Defined 11 sub-tasks covering scanner, prompt hardening, insight module, and UI
- Tier 3 (PDF color inspection) deferred to follow-up task

## 2026-03-18 — implementation

- Built `src/services/prompt-injection/scanner.ts` with 20+ regex patterns across 5 categories
- Created `src/services/prompt-injection/preamble.ts` with anti-injection preamble constant
- Hardened all 14 system prompts (resume-parsing + 13 insight prompts) with anti-injection preamble
- Created insight #24 module: schema, prompt, compute under `src/services/insights/resume-integrity/`
- Added `ResumeIntegrityData` interface to `src/services/insights/types.ts`
- Built `ResumeIntegrityDisplay` component with risk-level banners, finding cards, and recommendations
- Registered in match-persistence, insights API route, and DashboardMatchResults
- Added #24 card to InsightsShowcase homepage (active, Business Free access)
- Updated `insights-and-analytics.mdc` with full #24 spec and defense architecture diagram
- All 11 sub-tasks completed
