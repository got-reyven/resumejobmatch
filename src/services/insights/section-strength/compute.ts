import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { sectionStrengthSchema } from "./schema";
import { buildSectionStrengthPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  SectionStrengthData,
} from "../types";

const INSIGHT_ID = "section-strength";
const INSIGHT_NAME = "Resume Section Strength";

export async function computeSectionStrength(
  ctx: InsightComputeContext
): Promise<InsightResult<SectionStrengthData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildSectionStrengthPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: sectionStrengthSchema,
        schemaName: "section_strength",
        maxTokens: 2000,
        temperature: 0.1,
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
