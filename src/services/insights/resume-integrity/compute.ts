import { getAIProvider } from "@/services/ai/provider";
import { withAIResilience } from "@/services/ai/utils/resilience";
import { scanForInjections } from "@/services/prompt-injection/scanner";
import { resumeIntegritySchema } from "./schema";
import { buildResumeIntegrityPrompt } from "./prompt";
import type {
  InsightResult,
  InsightComputeContext,
  ResumeIntegrityData,
} from "../types";

const INSIGHT_ID = "resumeIntegrity";
const INSIGHT_NAME = "Resume Integrity Check";

export async function computeResumeIntegrity(
  ctx: InsightComputeContext
): Promise<InsightResult<ResumeIntegrityData>> {
  const resumeText = [
    ctx.resume.name,
    ctx.resume.summary,
    ctx.resume.skills.join(", "),
    ctx.resume.key_responsibilities.join("; "),
    ...ctx.resume.experience.map(
      (e) =>
        `${e.title} ${e.company} ${e.description ?? ""} ${e.highlights.join(" ")}`
    ),
  ]
    .filter(Boolean)
    .join("\n");

  const scanResult = scanForInjections(resumeText);

  const provider = getAIProvider();
  const { systemPrompt, userPrompt } = buildResumeIntegrityPrompt(
    resumeText,
    scanResult
  );

  const data = await withAIResilience(
    () =>
      provider.generateStructuredOutput({
        systemPrompt,
        prompt: userPrompt,
        schema: resumeIntegritySchema,
        schemaName: "resume_integrity_check",
        maxTokens: 1500,
        temperature: 0.1,
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
