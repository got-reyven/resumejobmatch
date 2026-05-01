import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { salaryRangeSchema } from "./schema";
import { buildSalaryRangePrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  SalaryRangeData,
} from "../types";

const INSIGHT_ID = "salaryRange";
const INSIGHT_NAME = "Salary Range Indicator";

export async function computeSalaryRange(
  ctx: InsightComputeContext
): Promise<InsightResult<SalaryRangeData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildSalaryRangePrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: salaryRangeSchema,
        schemaName: "salary_range_indicator",
        maxTokens: 1500,
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
