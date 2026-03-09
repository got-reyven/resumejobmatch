import { z } from "zod";

export const overallScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  dimensions: z.object({
    skills: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    qualifications: z.number().min(0).max(100),
    overall_fit: z.number().min(0).max(100),
  }),
  summary: z.string(),
});

export type OverallScoreOutput = z.infer<typeof overallScoreSchema>;
