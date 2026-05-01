import { z } from "zod";

export const salaryRangeSchema = z.object({
  range: z.object({
    low: z.number(),
    mid: z.number(),
    high: z.number(),
    currency: z.string(),
  }),
  confidence: z.enum(["high", "moderate", "low"]),
  factors: z.array(z.string()),
  disclaimer: z.string(),
});
