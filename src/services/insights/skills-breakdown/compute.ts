import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { skillsBreakdownSchema } from "./schema";
import { buildSkillsBreakdownPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  SkillsBreakdownData,
} from "../types";

const INSIGHT_ID = "skills-breakdown";
const INSIGHT_NAME = "Skills Match Breakdown";

export async function computeSkillsBreakdown(
  ctx: InsightComputeContext
): Promise<InsightResult<SkillsBreakdownData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildSkillsBreakdownPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: skillsBreakdownSchema,
        schemaName: "skills_breakdown",
        maxTokens: 2000,
        temperature: 0.1,
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
