# Task: Resume PDF Parsing

## Goal

Enable users to upload a PDF resume and have it automatically parsed into structured data (name, skills, experience, education) using AI.

## Scope

**In scope:**

- PDF file sent directly to OpenAI via Responses API for visual + text extraction
- Text-based fallback extraction via `unpdf` for non-PDF flows
- AI provider abstraction layer (OpenAI first)
- Structured resume parsing with Zod-validated output
- API endpoint for upload + parse
- Frontend integration with parsed data preview (contact details, skills, experience, education with year ranges)
- Reliability patterns (retry, timeout)

**Out of scope:**

- DOCX parsing (separate task)
- Supabase Storage persistence (processed in-memory for now)
- AI response caching (separate task)
- All AI calls use platform system key (no user-provided keys)

## Approach

1. Install dependencies (`pdf-parse`, `openai`)
2. Define `ParsedResume` Zod schema as the AI output contract
3. Build PDF text extraction service
4. Build AI provider abstraction (interface → OpenAI implementation)
5. Write resume parsing prompt function
6. Create API route `POST /api/v1/resumes/parse`
7. Wire frontend upload component to call the API and display parsed data

## Dependencies

- project-setup (done)
- Database migration (done — `resumes` table exists)
- OpenAI API key in `.env.local` (confirmed)

## Acceptance Criteria

- [ ] User uploads a PDF and sees extracted structured data
- [ ] AI returns Zod-validated ParsedResume object
- [ ] API returns proper error for non-PDF files or corrupt uploads
- [ ] Provider abstraction allows swapping AI provider without business logic changes
- [ ] Retry + timeout patterns protect against AI service failures
