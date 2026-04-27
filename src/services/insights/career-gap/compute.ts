import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { careerGapSchema } from "./schema";
import { buildCareerGapPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  CareerGapData,
} from "../types";

const INSIGHT_ID = "careerGap";
const INSIGHT_NAME = "Career Gap Analysis";

export async function computeCareerGap(
  ctx: InsightComputeContext
): Promise<InsightResult<CareerGapData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildCareerGapPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: careerGapSchema,
        schemaName: "career_gap_analysis",
        maxTokens: 2000,
        temperature: 0.2,
      }),
    { maxRetries: 2, timeoutMs: 30000 }
  );

  return {
    id: INSIGHT_ID,
    name: INSIGHT_NAME,
    tier: 2,
    tab: "shared",
    status: "success",
    data,
    computedAt: new Date().toISOString(),
    modelUsed: provider.defaultModel,
    tokensUsed: 0,
  };
}
