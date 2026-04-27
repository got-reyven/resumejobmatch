import { z } from "zod";

export const careerGapSchema = z.object({
  gaps: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      duration_months: z.number(),
      possible_context: z.string().nullable(),
    })
  ),
  has_significant_gaps: z.boolean(),
  summary: z.string(),
});
