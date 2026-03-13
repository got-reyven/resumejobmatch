# Task: Homepage Update — Qualification Fit Active + Pain Points Section

## Goal

Improve the homepage by reflecting the newly active Qualification Fit insight and adding a compelling problem statement section with real-world job market statistics.

## Scope

**In scope:**

- Update Qualification Fit card in InsightsShowcase to full opacity (available: true, access: "everyone")
- Create a new "Pain Points" section after How It Works with real-world statistics about job seeking/hiring challenges
- Statistics must be sourced from reliable, well-known sources

**Out of scope:**

- Changes to other homepage sections
- Changes to pricing or feature lists

## Approach

1. Update `InsightsShowcase.tsx` — set Qualification Fit to `available: true`, `access: "everyone"`
2. Create `PainPoints.tsx` component with problem statements and statistics
3. Add component to `page.tsx` after `HowItWorks`

## Acceptance Criteria

- [ ] Qualification Fit card in InsightsShowcase is at full opacity
- [ ] New section appears after How It Works with problem statements
- [ ] Statistics cite reliable sources
- [ ] Section is responsive and follows the design system
