import { z } from "zod";

export const atsKeywordsSchema = z.object({
  keywords: z.array(
    z.object({
      keyword: z.string(),
      category: z.enum([
        "technical",
        "tool",
        "certification",
        "soft_skill",
        "other",
      ]),
      found_in_resume: z.boolean(),
      match_type: z.enum(["exact", "semantic", "missing"]),
      resume_context: z.string().nullable(),
    })
  ),
  ats_pass_likelihood: z.enum(["high", "medium", "low"]),
  suggestion: z.string(),
});

export type ATSKeywordsOutput = z.infer<typeof atsKeywordsSchema>;
