import { z } from "zod";

export const rewriteSuggestionsSchema = z.object({
  rewrites: z
    .array(
      z.object({
        original: z.string(),
        suggested: z.string(),
        rationale: z.string(),
        section: z.string(),
      })
    )
    .max(5),
});

export type RewriteSuggestionsOutput = z.infer<typeof rewriteSuggestionsSchema>;
