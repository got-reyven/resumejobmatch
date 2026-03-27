import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { rewriteSuggestionsSchema } from "./schema";
import { buildRewriteSuggestionsPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  RewriteSuggestionsData,
} from "../types";

const INSIGHT_ID = "rewriteSuggestions";
const INSIGHT_NAME = "Rewrite Suggestions";

export async function computeRewriteSuggestions(
  ctx: InsightComputeContext
): Promise<InsightResult<RewriteSuggestionsData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildRewriteSuggestionsPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: rewriteSuggestionsSchema,
        schemaName: "rewrite_suggestions",
        maxTokens: 2500,
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
