import { z } from "zod";

export const riskAreasSchema = z.object({
  risks: z.array(
    z.object({
      area: z.string(),
      severity: z.enum(["critical", "moderate", "minor"]),
      detail: z.string(),
      mitigation: z.string().nullable(),
    })
  ),
  summary: z.string(),
});

export type RiskAreasOutput = z.infer<typeof riskAreasSchema>;
