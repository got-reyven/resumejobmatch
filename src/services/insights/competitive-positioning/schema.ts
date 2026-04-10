import { z } from "zod";

export const competitivePositioningSchema = z.object({
  positioning: z.string(),
  confidence: z.enum(["high", "moderate", "low"]),
  strong_areas: z.array(z.string()),
  weak_areas: z.array(z.string()),
  recommendation: z.string(),
});

export type CompetitivePositioningOutput = z.infer<
  typeof competitivePositioningSchema
>;
