import { z } from "zod";

export const skillsBreakdownSchema = z.object({
  matched: z.array(
    z.object({
      skill: z.string(),
      type: z.enum(["exact", "semantic"]),
      resume_term: z.string().nullable(),
    })
  ),
  missing: z.array(
    z.object({
      skill: z.string(),
      priority: z.enum(["required", "preferred"]),
    })
  ),
  coverage_percent: z.number().min(0).max(100),
});

export type SkillsBreakdownOutput = z.infer<typeof skillsBreakdownSchema>;
