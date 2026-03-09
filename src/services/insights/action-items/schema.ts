import { z } from "zod";

export const actionItemsSchema = z.object({
  actions: z
    .array(
      z.object({
        priority: z.number().min(1).max(3),
        title: z.string(),
        bullets: z.array(z.string()).min(2).max(4),
        section: z.string(),
        impact: z.enum(["high", "medium"]),
      })
    )
    .length(3),
});

export type ActionItemsOutput = z.infer<typeof actionItemsSchema>;
