# History: Risk Areas & Gaps (Insight #10)

## 2026-03-16 — Agent

- Created full AI module: schema, prompt, compute function at `src/services/insights/risk-areas/`
- Schema: risks array with area, severity (critical/moderate/minor), detail, nullable mitigation; plus summary
- Prompt instructs AI to compare candidate profile against job requirements, classify gaps by severity, suggest mitigations
- Added `RiskAreasData` interface to `src/services/insights/types.ts`
- Created `RiskAreasDisplay` component with severity-coded cards (color bars, icons, badges), summary counters, and tier gating (Free: top 3 risks, Pro: all)
- Registered in `INSIGHT_META` (hiring_manager, tier 2), `computeMap`, `DashboardMatchResults` (business tab, on-demand via Generate button), and match detail page
- Enabled card on homepage InsightsShowcase (set `available: true`)
- All TypeScript errors are pre-existing; no new errors introduced
