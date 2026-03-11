import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .trim(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
