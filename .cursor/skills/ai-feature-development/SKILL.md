---
name: ai-feature-development
description: End-to-end workflow for building AI-powered features with LLM provider abstraction, structured output, prompt engineering, cost control, and reliability patterns. Use when implementing resume parsing, skill matching, job analysis, or any AI-powered functionality.
---

# AI Feature Development

## When to Use

Invoke this skill when:

- Building a new AI-powered feature (parsing, matching, scoring, analysis)
- Writing or optimizing prompts
- Integrating a new LLM provider
- Implementing cost controls or caching for AI calls

## Development Workflow

```
Task Progress:
- [ ] Step 1: Define the AI task and output schema
- [ ] Step 2: Select model tier
- [ ] Step 3: Write prompt functions
- [ ] Step 4: Implement via AIProvider interface
- [ ] Step 5: Add reliability patterns
- [ ] Step 6: Add caching layer
- [ ] Step 7: Set rate limits and cost controls
- [ ] Step 8: Write tests
```

## Step 1: Define Task and Output Schema

```typescript
// src/lib/validations/ai-resume-parsing.ts
import { z } from "zod";

export const parsedResumeSchema = z.object({
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  summary: z.string().nullable(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      description: z.string().nullable(),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.number().nullable(),
    })
  ),
});

export type ParsedResume = z.infer<typeof parsedResumeSchema>;
```

## Step 2: Model Selection

| Task                     | Tier  | Model Examples              | Est. Cost/Call |
| ------------------------ | ----- | --------------------------- | -------------- |
| Resume parsing           | Cheap | gpt-4o-mini, claude-3-haiku | ~$0.001        |
| Skill extraction         | Cheap | gpt-4o-mini, claude-3-haiku | ~$0.0005       |
| Job-resume matching      | Mid   | gpt-4o, claude-3.5-sonnet   | ~$0.005        |
| Detailed analysis/report | Mid   | gpt-4o, claude-3.5-sonnet   | ~$0.01         |

Always start with cheapest tier. Upgrade only when output quality doesn't meet requirements.

## Step 3: Prompt Functions

```typescript
// src/services/ai/prompts/resume-parsing.ts

export function buildResumeParsingPrompt(resumeText: string) {
  return {
    systemPrompt: `You are a resume parser. Extract structured data from resume text.

Rules:
- Extract all identifiable fields accurately
- If a field cannot be determined from the text, use null
- Skills should be individual items, not comma-separated strings
- Dates should be in ISO format when possible
- Do not infer or fabricate information not present in the text`,

    userPrompt: `Parse the following resume and extract structured data:

---
${resumeText.slice(0, 8000)}
---`,
  };
}
```

### Prompt Best Practices

- System prompt: role + rules + output constraints
- User prompt: the variable data, truncated to token budget
- Include 2-3 few-shot examples for complex extraction tasks
- Test prompts with edge cases (sparse resumes, non-English, unusual formats)
- Version prompts alongside code — they are business logic

## Step 4: Provider Implementation

```typescript
// src/services/ai/resume-ai-service.ts
import { getAIProvider } from "./provider";
import {
  parsedResumeSchema,
  type ParsedResume,
} from "@/lib/validations/ai-resume-parsing";
import { buildResumeParsingPrompt } from "./prompts/resume-parsing";

export async function parseResumeWithAI(
  resumeText: string
): Promise<ParsedResume> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildResumeParsingPrompt(resumeText);

  return provider.generateStructuredOutput({
    systemPrompt,
    prompt: userPrompt,
    schema: parsedResumeSchema,
    maxTokens: 2000,
    temperature: 0.1,
  });
}
```

## Step 5: Reliability Patterns

```typescript
// src/services/ai/utils/resilience.ts
import { AppError } from "@/lib/errors";

export async function withAIResilience<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; timeoutMs?: number; fallback?: () => T }
): Promise<T> {
  const { maxRetries = 2, timeoutMs = 30000, fallback } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(new AppError("AI request timed out", "AI_TIMEOUT", 504)),
            timeoutMs
          )
        ),
      ]);
    } catch (error) {
      if (attempt === maxRetries) {
        if (fallback) return fallback();
        throw error;
      }
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw new AppError("AI service unavailable", "AI_UNAVAILABLE", 503);
}
```

## Step 6: Caching

```typescript
// Cache AI responses to avoid duplicate processing
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export function generateCacheKey(input: string, model: string): string {
  return crypto.createHash("sha256").update(`${model}:${input}`).digest("hex");
}

export async function getCachedAIResponse<T>(
  cacheKey: string
): Promise<T | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_cache")
    .select("response")
    .eq("cache_key", cacheKey)
    .single();
  return data?.response ?? null;
}
```

## Step 7: Cost Controls

```typescript
// Per-user daily limits
const AI_DAILY_LIMITS = {
  free: { resumeParses: 5, matchRequests: 10 },
  pro: { resumeParses: 50, matchRequests: 100 },
};

export async function checkAIRateLimit(
  userId: string,
  action: string
): Promise<boolean> {
  // Check usage count in database for today
  // Return false if limit exceeded
}
```

## Step 8: Testing AI Features

```typescript
// Mock the AI provider at the boundary
vi.mock("@/services/ai/provider", () => ({
  getAIProvider: () => ({
    generateStructuredOutput: vi.fn().mockResolvedValue({
      name: "John Doe",
      skills: ["TypeScript", "React"],
      experience: [],
      education: [],
    }),
  }),
}));

describe("parseResumeWithAI", () => {
  it("returns parsed resume matching schema", async () => {
    const result = await parseResumeWithAI(
      "John Doe\nSkills: TypeScript, React"
    );
    expect(result.name).toBe("John Doe");
    expect(result.skills).toContain("TypeScript");
  });
});
```

## AI Service File Structure

```
src/services/ai/
  types.ts                    # AIProvider interface
  provider.ts                 # Factory: returns active provider
  openai-provider.ts          # OpenAI implementation
  anthropic-provider.ts       # Anthropic implementation
  prompts/
    resume-parsing.ts         # Resume parsing prompts
    skill-matching.ts         # Skill matching prompts
    job-analysis.ts           # Job description analysis
  utils/
    resilience.ts             # Retry, timeout, circuit breaker
    cache.ts                  # Response caching
    rate-limit.ts             # Per-user rate limiting
  resume-ai-service.ts        # Resume AI operations
  matching-ai-service.ts      # Matching AI operations
```
