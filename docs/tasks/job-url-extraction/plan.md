# Task: Job URL Extraction

## Goal

Allow users to paste a public job posting URL instead of manually copying job description text. The system fetches the page and uses AI to extract the job details.

## Scope

**In scope:**

- API endpoint to fetch a URL and extract job description via AI
- Update JobDescriptionInput URL tab to call the endpoint and populate the text area
- Loading and error states in the UI
- Support for major job boards (LinkedIn, Indeed, Glassdoor, etc.) and general pages

**Out of scope:**

- Headless browser rendering (JS-rendered pages)
- Authentication-protected job pages
- Caching extracted job descriptions

## Approach

1. Create `POST /api/v1/jobs/extract-url` — fetches page HTML, strips to text, uses AI to extract job description
2. Update `JobDescriptionInput` URL tab — add "Extract" button, loading state, auto-populate text area on success
3. Pass extracted URL as `sourceUrl` for match persistence

## Acceptance Criteria

- [ ] User can paste a job URL and click Extract
- [ ] AI extracts the job description from the page content
- [ ] Extracted text populates the text area automatically (switches to text mode)
- [ ] Loading and error states shown during extraction
- [ ] Extracted URL is available as sourceUrl for match saving
