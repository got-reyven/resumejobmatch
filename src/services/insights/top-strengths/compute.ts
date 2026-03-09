import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { topStrengthsSchema } from "./schema";
import { buildTopStrengthsPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  TopStrengthsData,
} from "../types";

const INSIGHT_ID = "top-strengths";
const INSIGHT_NAME = "Top Strengths";

export async function computeTopStrengths(
  ctx: InsightComputeContext
): Promise<InsightResult<TopStrengthsData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildTopStrengthsPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: topStrengthsSchema,
        schemaName: "top_strengths",
        maxTokens: 1200,
        temperature: 0.2,
      }),
    { maxRetries: 2, timeoutMs: 30000 }
  );

  return {
    id: INSIGHT_ID,
    name: INSIGHT_NAME,
    tier: 1,
    tab: "hiring_manager",
    status: "success",
    data,
    computedAt: new Date().toISOString(),
    modelUsed: provider.defaultModel,
    tokensUsed: 0,
  };
}
