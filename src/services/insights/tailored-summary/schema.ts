import { z } from "zod";

export const tailoredSummarySchema = z.object({
  current_summary: z.string().nullable(),
  suggested_summary: z.string(),
  key_changes: z.array(z.string()),
});

export type TailoredSummaryOutput = z.infer<typeof tailoredSummarySchema>;
