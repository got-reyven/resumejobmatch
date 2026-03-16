import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { tailoredSummarySchema } from "./schema";
import { buildTailoredSummaryPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  TailoredSummaryData,
} from "../types";

const INSIGHT_ID = "tailored-summary";
const INSIGHT_NAME = "Tailored Summary Suggestion";

export async function computeTailoredSummary(
  ctx: InsightComputeContext
): Promise<InsightResult<TailoredSummaryData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildTailoredSummaryPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: tailoredSummarySchema,
        schemaName: "tailored_summary",
        maxTokens: 1500,
        temperature: 0.3,
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
