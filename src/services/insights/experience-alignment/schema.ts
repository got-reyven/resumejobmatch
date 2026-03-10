import { z } from "zod";

export const experienceAlignmentSchema = z.object({
  total_relevant_years: z.number(),
  required_years: z.number().nullable(),
  seniority_fit: z.enum(["under", "match", "over"]),
  industry_alignment: z.enum(["same", "adjacent", "different"]),
  role_mapping: z.array(
    z.object({
      resume_role: z.string(),
      relevance: z.enum(["direct", "transferable", "unrelated"]),
      relevant_aspects: z.array(z.string()),
    })
  ),
  summary: z.string(),
});

export type ExperienceAlignmentOutput = z.infer<
  typeof experienceAlignmentSchema
>;
