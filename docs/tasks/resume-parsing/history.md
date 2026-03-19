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
