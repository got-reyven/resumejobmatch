import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { atsKeywordsSchema } from "./schema";
import { buildATSKeywordsPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  ATSKeywordsData,
} from "../types";

const INSIGHT_ID = "ats-keywords";
const INSIGHT_NAME = "ATS Keyword Analysis";

export async function computeATSKeywords(
  ctx: InsightComputeContext
): Promise<InsightResult<ATSKeywordsData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildATSKeywordsPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: atsKeywordsSchema,
        schemaName: "ats_keywords",
        maxTokens: 2500,
        temperature: 0.1,
      }),
    { maxRetries: 2, timeoutMs: 30000 }
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
