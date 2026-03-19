# To-Do: Resume PDF Parsing

| #   | Sub-task                                       | Assigned To     | Status | Notes                                           |
| --- | ---------------------------------------------- | --------------- | ------ | ----------------------------------------------- |
| 1   | Install pdf-parse + OpenAI SDK                 | devops-engineer | done   | pdf-parse v2.4.5, openai v5                     |
| 2   | Create ParsedResume Zod schema                 | architect       | done   | src/lib/validations/parsed-resume.ts            |
| 3   | Build PDF text extraction service              | api-engineer    | done   | src/services/pdf-extractor.ts                   |
| 4   | Build AI provider abstraction                  | ai-engineer     | done   | types.ts, provider.ts, openai-provider.ts       |
| 5   | Write resume parsing prompt                    | ai-engineer     | done   | src/services/ai/prompts/resume-parsing.ts       |
| 6   | Build resume AI parsing service                | ai-engineer     | done   | src/services/ai/resume-ai-service.ts            |
| 7   | Create API endpoint POST /api/v1/resumes/parse | api-engineer    | done   | src/app/api/v1/resumes/parse/route.ts           |
| 8   | Wire frontend + parsed preview                 | ui-ux-engineer  | done   | Updated ResumeUpload + MatchingHero             |
| 9   | Verify end-to-end flow                         | qa-engineer     | done   | tsc passes, eslint passes, 400 on empty request |
| 10  | Add key_responsibilities to schema + prompt    | ai-engineer     | done   | Extracts standalone responsibilities sections   |
| 11  | Display key_responsibilities in UI             | ui-ux-engineer  | done   | ParsedResumePreview + ResumeDetailPanel         |
| 12  | Add key_responsibilities to insight prompts    | ai-engineer     | done   | All 11 insight prompts updated                  |
