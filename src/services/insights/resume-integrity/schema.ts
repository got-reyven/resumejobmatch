import { z } from "zod";

export const resumeIntegritySchema = z.object({
  risk_level: z.enum(["none", "low", "medium", "high"]),
  is_clean: z.boolean(),
  findings: z.array(
    z.object({
      type: z.enum([
        "score_inflation",
        "instruction_override",
        "ranking_manipulation",
        "system_prompt_leak",
        "role_hijack",
        "suspicious_content",
      ]),
      description: z.string(),
      excerpt: z.string(),
      severity: z.enum(["warning", "critical"]),
    })
  ),
  summary: z.string(),
  recommendation: z.string(),
});

export type ResumeIntegrityOutput = z.infer<typeof resumeIntegritySchema>;
