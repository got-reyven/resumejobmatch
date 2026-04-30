import { z } from "zod";

export const cultureCommunicationSchema = z.object({
  indicators: z.array(
    z.object({
      dimension: z.string(),
      signal: z.string(),
      evidence: z.string(),
    })
  ),
  communication_style: z.string(),
  disclaimer: z.string(),
});
