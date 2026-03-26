import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { overqualificationSchema } from "./schema";
import { buildOverqualificationPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  OverqualificationData,
} from "../types";

const INSIGHT_ID = "overqualification";
const INSIGHT_NAME = "Overqualification Assessment";

export async function computeOverqualification(
  ctx: InsightComputeContext
): Promise<InsightResult<OverqualificationData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildOverqualificationPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: overqualificationSchema,
        schemaName: "overqualification_assessment",
        maxTokens: 1500,
        temperature: 0.2,
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
