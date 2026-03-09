import { z } from "zod";

export const matchStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const insightTabSchema = z.enum([
  "shared",
  "jobseeker",
  "hiring_manager",
]);

export const matchSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  resume_id: z.string().uuid(),
  job_description_id: z.string().uuid(),
  overall_score: z.number().min(0).max(100).nullable(),
  status: matchStatusSchema,
  completed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  deleted_at: z.string().datetime().nullable(),
});

export const matchInsightSchema = z.object({
  id: z.string().uuid(),
  match_id: z.string().uuid(),
  insight_key: z.string().min(1),
  tab: insightTabSchema,
  tier: z.number().int().min(1).max(3),
  title: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
  created_at: z.string().datetime(),
});

export type MatchStatus = z.infer<typeof matchStatusSchema>;
export type InsightTab = z.infer<typeof insightTabSchema>;
export type Match = z.infer<typeof matchSchema>;
export type MatchInsight = z.infer<typeof matchInsightSchema>;
