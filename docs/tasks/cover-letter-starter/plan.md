# Task: Cover Letter Starter (#18)

## Goal

Generate a tailored cover letter based on the match analysis so jobseekers can skip the blank-page problem and submit a compelling, role-specific letter.

## Scope

**In scope:**

- AI module (schema, prompt, compute) for Cover Letter generation
- Display component with Free/Pro tier gating and copy-to-clipboard
- Integration into match results pipeline
- Homepage insight card activation
- Documentation updates

**Out of scope:**

- PDF export of cover letter
- Multi-template style selection

## Approach

1. Create schema, prompt, and compute modules following existing insight patterns
2. Add `CoverLetterData` type to `types.ts`
3. Build `CoverLetterDisplay` component with tier gating:
   - **Jobseeker Free**: Opening paragraph (3–4 sentences) + key points used
   - **Jobseeker Pro**: Full cover letter (opening + body paragraphs + closing) + key points used
4. Wire into match-persistence, API route, DashboardMatchResults, and detail page
5. Activate card #18 on homepage
6. Update documentation

## Dependencies

- Existing insight module infrastructure
- Anti-injection preamble

## Acceptance Criteria

- [ ] AI generates a professional, tailored cover letter based on resume + job match
- [ ] Free users see opening paragraph only
- [ ] Pro users see the complete cover letter
- [ ] Copy-to-clipboard functionality works for the visible content
- [ ] Insight appears in Jobseeker tab
- [ ] Card #18 active on homepage
- [ ] Documentation updated
