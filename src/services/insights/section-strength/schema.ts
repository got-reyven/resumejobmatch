import { z } from "zod";

export const sectionStrengthSchema = z.object({
  sections: z.array(
    z.object({
      name: z.enum([
        "summary",
        "skills",
        "experience",
        "education",
        "certifications",
        "other",
      ]),
      score: z.number().min(1).max(5),
      feedback: z.string(),
      suggestion: z.string().nullable(),
    })
  ),
  weakest: z.string(),
  summary: z.string(),
});

export type SectionStrengthOutput = z.infer<typeof sectionStrengthSchema>;
