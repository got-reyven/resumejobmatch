# Task: Tailored Summary Suggestion (Insight #9)

## Goal

Generate an AI-optimized professional summary tailored to a specific job description, showing before/after comparison and key changes. Tier-gated: free users see the first sentence only, Pro users get the full summary.

## Scope

**In scope:**

- AI module (schema, prompt, compute)
- Display component with tier gating (free = 1 sentence + upgrade CTA, pro = full summary)
- On-demand generation only (registered users, via Generate button)
- Registration in all integration points
- Enable on homepage insights showcase

**Out of scope:**

- Public/guest access
- Copy-to-clipboard (future enhancement)

## Acceptance Criteria

- [ ] AI generates a 3–4 sentence summary tailored to the job
- [ ] Shows before/after comparison (current vs suggested)
- [ ] Lists key changes made
- [ ] Free users see first sentence only with blurred remainder + upgrade CTA
- [ ] Pro users see the full summary
- [ ] Available only in dashboard via "Generate" button (jobseeker tab)
- [ ] Card enabled on homepage insights section
