import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { industryJargonSchema } from "./schema";
import { buildIndustryJargonPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  IndustryJargonData,
} from "../types";

const INSIGHT_ID = "industryJargon";
const INSIGHT_NAME = "Industry Jargon Check";

export async function computeIndustryJargon(
  ctx: InsightComputeContext
): Promise<InsightResult<IndustryJargonData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildIndustryJargonPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: industryJargonSchema,
        schemaName: "industry_jargon_check",
        maxTokens: 2000,
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
