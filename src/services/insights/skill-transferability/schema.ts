import { z } from "zod";

export const skillTransferabilitySchema = z.object({
  transfers: z.array(
    z.object({
      required_skill: z.string(),
      candidate_skill: z.string(),
      transferability: z.enum(["high", "moderate", "low"]),
      rationale: z.string(),
    })
  ),
  summary: z.string(),
});
