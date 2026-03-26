import { z } from "zod";

export const overqualificationSchema = z.object({
  is_overqualified: z.boolean(),
  confidence: z.enum(["high", "moderate", "low"]),
  indicators: z.array(z.string()),
  recommendation: z.string(),
});

export type OverqualificationOutput = z.infer<typeof overqualificationSchema>;
