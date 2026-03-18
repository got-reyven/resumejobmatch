import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { interviewFocusSchema } from "./schema";
import { buildInterviewFocusPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  InterviewFocusData,
} from "../types";

const INSIGHT_ID = "interview-focus";
const INSIGHT_NAME = "Interview Focus Points";

export async function computeInterviewFocus(
  ctx: InsightComputeContext
): Promise<InsightResult<InterviewFocusData>> {
  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildInterviewFocusPrompt(
    ctx.resume,
    ctx.jobDescription
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: interviewFocusSchema,
        schemaName: "interview_focus",
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
