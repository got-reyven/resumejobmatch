import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { coverLetterSchema } from "./schema";
import { buildCoverLetterPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  CoverLetterData,
} from "../types";

const INSIGHT_ID = "coverLetter";
const INSIGHT_NAME = "Cover Letter Starter";

export async function computeCoverLetter(
  ctx: InsightComputeContext
): Promise<InsightResult<CoverLetterData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildCoverLetterPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: coverLetterSchema,
        schemaName: "cover_letter_starter",
        maxTokens: 3000,
        temperature: 0.4,
      }),
    { maxRetries: 2, timeoutMs: 45000 }
  );

  return {
    id: INSIGHT_ID,
    name: INSIGHT_NAME,
    tier: 2,
    tab: "jobseeker",
    status: "success",
    data,
    computedAt: new Date().toISOString(),
    modelUsed: provider.defaultModel,
    tokensUsed: 0,
  };
}
