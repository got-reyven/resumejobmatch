import { getAIProvider } from "./provider";
import { withAIResilience } from "./utils/resilience";
import { buildResumeParsingPrompt } from "./prompts/resume-parsing";
import {
  parsedResumeSchema,
  type ParsedResume,
} from "@/lib/validations/parsed-resume";

export async function parseResumeWithAI(
  resumeText: string
): Promise<ParsedResume> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildResumeParsingPrompt(resumeText);

  return withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: parsedResumeSchema,
        schemaName: "parsed_resume",
        maxTokens: 3000,
        temperature: 0.1,
      }),
    { maxRetries: 2, timeoutMs: 30000 }
  );
}
