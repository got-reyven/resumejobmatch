import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { cultureCommunicationSchema } from "./schema";
import { buildCultureCommunicationPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  CultureCommunicationData,
} from "../types";

const INSIGHT_ID = "cultureCommunication";
const INSIGHT_NAME = "Culture & Communication Indicators";

export async function computeCultureCommunication(
  ctx: InsightComputeContext
): Promise<InsightResult<CultureCommunicationData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildCultureCommunicationPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: cultureCommunicationSchema,
        schemaName: "culture_communication_indicators",
        maxTokens: 2500,
        temperature: 0.3,
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
