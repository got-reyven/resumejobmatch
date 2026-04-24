import { z } from "zod";

export const industryJargonSchema = z.object({
  industry: z.string(),
  terms: z.array(
    z.object({
      term: z.string(),
      present: z.boolean(),
      suggestion: z.string().nullable(),
    })
  ),
  summary: z.string(),
});

export type IndustryJargonOutput = z.infer<typeof industryJargonSchema>;
