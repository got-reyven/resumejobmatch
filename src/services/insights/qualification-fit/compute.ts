import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { qualificationFitSchema } from "./schema";
import { buildQualificationFitPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  QualificationFitData,
} from "../types";

const INSIGHT_ID = "qualification-fit";
const INSIGHT_NAME = "Qualification Fit";

export async function computeQualificationFit(
  ctx: InsightComputeContext
): Promise<InsightResult<QualificationFitData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildQualificationFitPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: qualificationFitSchema,
        schemaName: "qualification_fit",
        maxTokens: 2000,
        temperature: 0.1,
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
