import { z } from "zod";

export const interviewFocusSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      rationale: z.string(),
      category: z.enum(["technical", "experience", "culture", "growth"]),
      listen_for: z.string(),
    })
  ),
});

export type InterviewFocusOutput = z.infer<typeof interviewFocusSchema>;
