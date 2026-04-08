# Task: Multi Job Description Matching

## Goal

Allow users to match a single resume against up to 3 job descriptions simultaneously, with tabbed results for easy comparison.

## Scope

**In scope:**

- Tabbed JD input (JD 1, JD 2, JD 3) with add/remove buttons
- Sequential matching against each JD
- Tabbed results display (Result 1, Result 2, Result 3)
- Each match saved separately in database
- Progress indicator during multi-match

**Out of scope:**

- Side-by-side comparison view (future enhancement)
- Combined/aggregate scoring across JDs
- Batch API endpoint (reuse existing single-match endpoint)

## Approach

1. Transform JD state from single string to array of up to 3 entries
2. Add JD tabs with "+" button to add more (max 3), "×" to remove
3. Run `POST /api/v1/matches` sequentially for each JD
4. Store results array; display with "Result 1", "Result 2", etc. tabs
5. Persist each match independently (existing save endpoint)

## Dependencies

- matching-engine (done)
- job-description-input (done)

## Acceptance Criteria

- [ ] Users can add up to 3 job descriptions via tabs
- [ ] Each JD tab has full Paste Text / Paste URL functionality
- [ ] Matching runs against all provided JDs
- [ ] Results display with tabs (Result 1, Result 2, etc.)
- [ ] Each result is saved independently with its own matchId
- [ ] Removing a JD tab clears its data
- [ ] Validation requires at least 1 valid JD to start matching
