import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { skillTransferabilitySchema } from "./schema";
import { buildSkillTransferabilityPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  SkillTransferabilityData,
} from "../types";

const INSIGHT_ID = "skillTransferability";
const INSIGHT_NAME = "Skill Transferability Map";

export async function computeSkillTransferability(
  ctx: InsightComputeContext
): Promise<InsightResult<SkillTransferabilityData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildSkillTransferabilityPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: skillTransferabilitySchema,
        schemaName: "skill_transferability_map",
        maxTokens: 2500,
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
