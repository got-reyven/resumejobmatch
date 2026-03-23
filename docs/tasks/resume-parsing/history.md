# History: Resume PDF Parsing

## 2026-03-07 — product-manager

- Created task documentation
- Scoped to PDF-only for this task (DOCX is separate)
- Defined acceptance criteria and agent assignments

## 2026-03-07 — ai-engineer / api-engineer / ui-ux-engineer

- Installed pdf-parse v2.4.5 (new class-based API) and OpenAI SDK v5
- Created ParsedResume Zod schema with experience, education, certifications, skills
- Built PDF text extraction using PDFParse class (v2 API: getText(), destroy())
- Built AI provider abstraction layer:
  - AIProvider interface with generateStructuredOutput<T>()
  - OpenAI provider using chat.completions.parse() with zodResponseFormat
  - Provider factory with system key resolution
  - Resilience utility: retry (2x exponential backoff) + timeout (30s)
- Created resume parsing prompt (system + user roles, 8K char truncation)
- Created API endpoint POST /api/v1/resumes/parse (multipart form, validation, extract, parse)
- Updated frontend: ResumeUpload now shows parsing/parsed/error states with preview
- MatchingHero orchestrates file upload → API call → display parsed resume
- Fixed Zod v4 z.record() signatures (requires key + value schemas)
- All checks pass: tsc --noEmit, eslint, dev server compiles clean

## 2026-03-18 — ai-engineer / ui-ux-engineer

- Added `key_responsibilities` field to ParsedResume schema (array of strings, defaults to empty)
- Updated resume parsing prompt to explicitly extract standalone "Key Responsibilities" sections
- Updated ParsedResumePreview (ResumeUpload.tsx) to display key responsibilities with bullet list
- Updated ResumeDetailPanel (match detail page) to display key responsibilities
- Updated all 11 insight prompt templates to include key responsibilities context in AI calls
- This fixes resumes that list responsibilities separately from skills/experience being underrepresented in matching

## 2026-03-18 — ai-engineer / api-engineer / ui-ux-engineer

### PDF extraction overhaul

- **Problem**: `pdf-parse` library failed to extract contact details (name, email, phone, location) from PDFs with header/sidebar layouts
- **Root cause**: `pdf-parse` uses basic text concatenation following internal PDF object order, missing text in positioned elements (headers, columns, styled sections)
- **Solution**: Send the raw PDF file directly to OpenAI via the Responses API (`input_file` with base64), letting OpenAI extract both text and visual layout natively
- Replaced `pdf-parse` with `unpdf` for the text fallback path (server-side `pdfjs-dist` wrapper with no worker issues)
- Resume parsing now uses `client.responses.parse()` with `zodTextFormat` for structured output from the Responses API

### Schema and display improvements

- Removed `.email()` Zod refinement from email field — OpenAI's structured output doesn't enforce format refinements, causing false 400 errors
- Added `start_year` and `end_year` fields to education schema (replaced single `year` field) for full year ranges (e.g. "2018–2022")
- Added contact details display (email, phone, location) with Lucide icons (Mail, Phone, MapPin) in ParsedResumePreview
- Updated education display in both ParsedResumePreview and ResumeDetailPanel to show year ranges
- Increased AI `maxTokens` from 3000 to 4096 for longer resumes
- Added error logging in API route and OpenAI provider for easier debugging
- Added stale Supabase auth cookie cleanup in middleware to prevent repeated `RefreshTokenNotFound` errors
