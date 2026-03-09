import { z } from "zod";

export const topStrengthsSchema = z.object({
  strengths: z
    .array(
      z.object({
        area: z.string(),
        evidence: z.string(),
        relevance: z.string(),
      })
    )
    .min(1)
    .max(3),
});

export type TopStrengthsOutput = z.infer<typeof topStrengthsSchema>;
