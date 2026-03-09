import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { overallScoreSchema } from "./schema";
import { buildOverallScorePrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  OverallScoreData,
} from "../types";

const INSIGHT_ID = "overall-score";
const INSIGHT_NAME = "Overall Match Score";

export async function computeOverallScore(
  ctx: InsightComputeContext
): Promise<InsightResult<OverallScoreData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildOverallScorePrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: overallScoreSchema,
        schemaName: "overall_match_score",
        maxTokens: 1000,
        temperature: 0.2,
      }),
    { maxRetries: 2, timeoutMs: 30000 }
  );

  return {
    id: INSIGHT_ID,
    name: INSIGHT_NAME,
    tier: 1,
    tab: "shared",
    status: "success",
    data,
    computedAt: new Date().toISOString(),
    modelUsed: provider.defaultModel,
    tokensUsed: 0,
  };
}
