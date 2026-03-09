import { z } from "zod";
import { parsedResumeSchema } from "./parsed-resume";

function wordCount(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export const matchRequestSchema = z.object({
  resume: parsedResumeSchema,
  jobDescription: z
    .string()
    .min(1, "Job description is required")
    .refine((val) => wordCount(val) >= 30, {
      message: "Job description must be at least 30 words",
    })
    .refine((val) => wordCount(val) <= 800, {
      message: "Job description must not exceed 800 words",
    }),
});

export type MatchRequest = z.infer<typeof matchRequestSchema>;
