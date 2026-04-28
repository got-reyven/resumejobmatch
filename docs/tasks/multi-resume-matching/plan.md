# Task: Multi-Resume Matching

## Goal

Enable Business users to match multiple resumes (up to 3) against a single job description, providing side-by-side comparison of candidates for the same role.

## Scope

**In scope:**

- Tabbed resume input (Resume 1/2/3) with Add Resume button, each supporting file upload + Search Resume
- Mutual exclusion: adding a 2nd resume disables Add JD, adding a 2nd JD disables Add Resume
- Match each resume-JD pair independently, generating full insights per pair
- Results displayed in tabs sorted by overall score (highest first), labeled "Candidate Name for Job Title"
- Business-only feature, up to 3 resumes for Business Free

**Out of scope:**

- Cross-resume comparative insights (Insight #21 — Comparison Matrix)
- Simultaneous multi-resume AND multi-JD (strictly one-to-many in either direction)
- Jobseeker access to this feature

## Approach

1. Modify the "New Match" page to support tabbed resume inputs (mirroring multi-JD pattern)
2. Implement mutual exclusion logic between multi-resume and multi-JD modes
3. Update matching loop to iterate resumes against a single JD when in multi-resume mode
4. Sort result tabs by overall score descending
5. Gate "Add Resume" button to Business users only

## Dependencies

- Existing multi-JD matching infrastructure
- ResumeUpload component

## Acceptance Criteria

- [ ] Business users can add up to 3 resume tabs
- [ ] Each resume tab supports file upload and Search Resume
- [ ] Adding a 2nd resume disables Add JD and vice versa
- [ ] Each resume-JD pair generates independent insights
- [ ] Result tabs are sorted by overall score (highest first)
- [ ] Result tabs show "Candidate Name for Job Title" format
- [ ] Jobseeker users cannot see Add Resume button
- [ ] Feature works on the dashboard match page
