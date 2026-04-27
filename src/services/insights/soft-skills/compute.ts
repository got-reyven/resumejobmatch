import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { softSkillsSchema } from "./schema";
import { buildSoftSkillsPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  SoftSkillsData,
} from "../types";

const INSIGHT_ID = "softSkills";
const INSIGHT_NAME = "Soft Skills Alignment";

export async function computeSoftSkills(
  ctx: InsightComputeContext
): Promise<InsightResult<SoftSkillsData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildSoftSkillsPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: softSkillsSchema,
        schemaName: "soft_skills_alignment",
        maxTokens: 2500,
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
