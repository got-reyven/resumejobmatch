import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { actionItemsSchema } from "./schema";
import { buildActionItemsPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  ActionItemsData,
} from "../types";

const INSIGHT_ID = "action-items";
const INSIGHT_NAME = "Top 3 Action Items";

export async function computeActionItems(
  ctx: InsightComputeContext
): Promise<InsightResult<ActionItemsData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildActionItemsPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: actionItemsSchema,
        schemaName: "action_items",
        maxTokens: 1500,
        temperature: 0.3,
      }),
    { maxRetries: 2, timeoutMs: 30000 }
  );

  return {
    id: INSIGHT_ID,
    name: INSIGHT_NAME,
    tier: 1,
    tab: "jobseeker",
    status: "success",
    data,
    computedAt: new Date().toISOString(),
    modelUsed: provider.defaultModel,
    tokensUsed: 0,
  };
}
