import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { experienceAlignmentSchema } from "./schema";
import { buildExperienceAlignmentPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  ExperienceAlignmentData,
} from "../types";

const INSIGHT_ID = "experience-alignment";
const INSIGHT_NAME = "Experience Alignment";

export async function computeExperienceAlignment(
  ctx: InsightComputeContext
): Promise<InsightResult<ExperienceAlignmentData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildExperienceAlignmentPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: experienceAlignmentSchema,
        schemaName: "experience_alignment",
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
