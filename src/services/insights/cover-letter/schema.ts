import { z } from "zod";

export const coverLetterSchema = z.object({
  opening_paragraph: z.string(),
  body_paragraphs: z.array(z.string()),
  closing_paragraph: z.string(),
  key_points_used: z.array(z.string()),
  tone: z.string(),
});
