import { z } from "zod";

export const qualificationFitSchema = z.object({
  qualifications: z.array(
    z.object({
      requirement: z.string(),
      type: z.enum(["required", "preferred"]),
      status: z.enum(["met", "partially_met", "not_found"]),
      evidence: z.string().nullable(),
      note: z.string().nullable(),
    })
  ),
  summary: z.string(),
});

export type QualificationFitOutput = z.infer<typeof qualificationFitSchema>;
