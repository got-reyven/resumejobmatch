import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { riskAreasSchema } from "./schema";
import { buildRiskAreasPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  RiskAreasData,
} from "../types";

const INSIGHT_ID = "risk-areas";
const INSIGHT_NAME = "Risk Areas & Gaps";

export async function computeRiskAreas(
  ctx: InsightComputeContext
): Promise<InsightResult<RiskAreasData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildRiskAreasPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: riskAreasSchema,
        schemaName: "risk_areas",
        maxTokens: 2000,
        temperature: 0.1,
      }),
    { maxRetries: 2, timeoutMs: 30000 }
  );

  return {
    id: INSIGHT_ID,
    name: INSIGHT_NAME,
    tier: 2,
    tab: "hiring_manager",
    status: "success",
    data,
    computedAt: new Date().toISOString(),
    modelUsed: provider.defaultModel,
    tokensUsed: 0,
  };
}
