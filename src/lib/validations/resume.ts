import { z } from "zod";
import { FILE_LIMITS } from "@/lib/constants/app";

export const fileTypeSchema = z.enum(["pdf", "docx"]);

export const createResumeSchema = z.object({
  file_name: z.string().min(1).max(255),
  file_type: fileTypeSchema,
  file_size: z
    .number()
    .int()
    .positive()
    .max(FILE_LIMITS.maxSizeBytes, "File exceeds 5MB limit"),
  storage_path: z.string().min(1),
});

export const resumeSchema = createResumeSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  raw_text: z.string().nullable(),
  parsed_data: z.record(z.string(), z.unknown()).nullable(),
  is_parsed: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});

export type CreateResume = z.infer<typeof createResumeSchema>;
export type Resume = z.infer<typeof resumeSchema>;
