import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { competitivePositioningSchema } from "./schema";
import { buildCompetitivePositioningPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  CompetitivePositioningData,
} from "../types";

const INSIGHT_ID = "competitivePositioning";
const INSIGHT_NAME = "Competitive Positioning";

export async function computeCompetitivePositioning(
  ctx: InsightComputeContext
): Promise<InsightResult<CompetitivePositioningData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildCompetitivePositioningPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: competitivePositioningSchema,
        schemaName: "competitive_positioning",
        maxTokens: 1500,
        temperature: 0.2,
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
