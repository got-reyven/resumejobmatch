import { z } from "zod";

export const softSkillsSchema = z.object({
  skills: z.array(
    z.object({
      skill: z.string(),
      required: z.boolean(),
      evidence_strength: z.enum(["strong", "moderate", "weak", "none"]),
      evidence: z.string().nullable(),
      suggestion: z.string().nullable(),
    })
  ),
  coverage_percent: z.number(),
  summary: z.string(),
});
