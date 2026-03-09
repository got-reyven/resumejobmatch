import { z } from "zod";

function wordCount(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export const createJobDescriptionSchema = z.object({
  raw_text: z
    .string()
    .min(1, "Job description is required")
    .refine((val) => wordCount(val) >= 30, {
      message: "Job description must be at least 30 words",
    })
    .refine((val) => wordCount(val) <= 800, {
      message: "Job description must not exceed 800 words",
    }),
  source_url: z.string().url().optional().or(z.literal("")),
  title: z.string().optional(),
  company: z.string().optional(),
});

export const jobDescriptionSchema = createJobDescriptionSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  parsed_data: z.record(z.string(), z.unknown()).nullable(),
  is_parsed: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type CreateJobDescription = z.infer<typeof createJobDescriptionSchema>;
export type JobDescription = z.infer<typeof jobDescriptionSchema>;
