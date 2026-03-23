# To-Do: Resume PDF Parsing

| #   | Sub-task                                         | Assigned To     | Status | Notes                                                  |
| --- | ------------------------------------------------ | --------------- | ------ | ------------------------------------------------------ |
| 1   | Install pdf-parse + OpenAI SDK                   | devops-engineer | done   | pdf-parse v2.4.5, openai v5                            |
| 2   | Create ParsedResume Zod schema                   | architect       | done   | src/lib/validations/parsed-resume.ts                   |
| 3   | Build PDF text extraction service                | api-engineer    | done   | src/services/pdf-extractor.ts                          |
| 4   | Build AI provider abstraction                    | ai-engineer     | done   | types.ts, provider.ts, openai-provider.ts              |
| 5   | Write resume parsing prompt                      | ai-engineer     | done   | src/services/ai/prompts/resume-parsing.ts              |
| 6   | Build resume AI parsing service                  | ai-engineer     | done   | src/services/ai/resume-ai-service.ts                   |
| 7   | Create API endpoint POST /api/v1/resumes/parse   | api-engineer    | done   | src/app/api/v1/resumes/parse/route.ts                  |
| 8   | Wire frontend + parsed preview                   | ui-ux-engineer  | done   | Updated ResumeUpload + MatchingHero                    |
| 9   | Verify end-to-end flow                           | qa-engineer     | done   | tsc passes, eslint passes, 400 on empty request        |
| 10  | Add key_responsibilities to schema + prompt      | ai-engineer     | done   | Extracts standalone responsibilities sections          |
| 11  | Display key_responsibilities in UI               | ui-ux-engineer  | done   | ParsedResumePreview + ResumeDetailPanel                |
| 12  | Add key_responsibilities to insight prompts      | ai-engineer     | done   | All 11 insight prompts updated                         |
| 13  | Fix PDF extraction missing contact details       | ai-engineer     | done   | Switched to OpenAI Responses API with direct PDF input |
| 14  | Replace pdf-parse with unpdf for text fallback   | api-engineer    | done   | unpdf handles server-side pdfjs-dist worker setup      |
| 15  | Add education year range (start_year/end_year)   | ai-engineer     | done   | Schema, prompt, and display updated                    |
| 16  | Display contact details (email, phone, location) | ui-ux-engineer  | done   | Added icons (Mail, Phone, MapPin) to preview           |
| 17  | Fix email Zod validation causing 400 errors      | api-engineer    | done   | Removed .email() refinement from schema                |
