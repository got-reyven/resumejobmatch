# Task: Prompt Injection Defense & Resume Integrity Check

## Goal

Protect the AI matching engine from prompt injection attacks hidden in resumes (e.g., white-on-white text instructing the AI to inflate scores), and surface detected manipulation attempts as an insight for hiring managers.

## Scope

**In scope:**

- Tier 1: Harden all system prompts with anti-injection instructions
- Tier 2: Pre-processing text scanner that detects suspicious patterns via regex before AI calls
- Insight #24: Resume Integrity Check — surfaces detected injection attempts as a hiring manager insight
- Display component showing risk level, detected patterns, and recommendations
- Integration into match-persistence, insights API, and DashboardMatchResults
- Homepage InsightsShowcase card activation

**Out of scope:**

- Tier 3: PDF-level hidden text detection via color/opacity inspection (follow-up task)
- Automatic blocking/rejection of resumes (flag only, human decides)
- Job description injection scanning (future scope)

## Approach

1. Build `src/services/prompt-injection/scanner.ts` — regex-based pattern detector
2. Harden all 13+ system prompts with anti-injection preamble
3. Create insight #24 module (schema, prompt, compute) using scanner results + optional AI verification
4. Build display component with risk level indicator
5. Integrate across the pipeline

## Dependencies

- matching-engine (done)
- resume-parsing (done)

## Acceptance Criteria

- [ ] All insight system prompts include anti-injection instructions
- [ ] Scanner detects common injection patterns (score inflation, instruction override, ranking manipulation)
- [ ] Resume Integrity Check insight renders in the Business tab with risk level and detected patterns
- [ ] Detected injections do not affect other insight scores (system prompt hardening)
- [ ] Homepage card #24 is active
- [ ] insights-and-analytics.mdc updated with #24 spec
