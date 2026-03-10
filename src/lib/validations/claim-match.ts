import { z } from "zod";
import { parsedResumeSchema } from "./parsed-resume";

const insightsSchema = z.object({
  overallScore: z.object({
    overall: z.number(),
    dimensions: z.object({
      skills: z.number(),
      experience: z.number(),
      qualifications: z.number(),
      overall_fit: z.number(),
    }),
    summary: z.string(),
  }),
  skillsBreakdown: z.object({
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
    coverage_percent: z.number(),
  }),
  actionItems: z.object({
    actions: z.array(
      z.object({
        priority: z.number(),
        title: z.string(),
        bullets: z.array(z.string()),
        section: z.string(),
        impact: z.enum(["high", "medium"]),
      })
    ),
  }),
  topStrengths: z.object({
    strengths: z.array(
      z.object({
        area: z.string(),
        evidence: z.string(),
        relevance: z.string(),
      })
    ),
  }),
  atsKeywords: z.object({
    keywords: z.array(
      z.object({
        keyword: z.string(),
        category: z.enum([
          "technical",
          "tool",
          "certification",
          "soft_skill",
          "other",
        ]),
        found_in_resume: z.boolean(),
        match_type: z.enum(["exact", "semantic", "missing"]),
        resume_context: z.string().nullable(),
      })
    ),
    ats_pass_likelihood: z.enum(["high", "medium", "low"]),
    suggestion: z.string(),
  }),
  experienceAlignment: z.object({
    total_relevant_years: z.number(),
    required_years: z.number().nullable(),
    seniority_fit: z.enum(["under", "match", "over"]),
    industry_alignment: z.enum(["same", "adjacent", "different"]),
    role_mapping: z.array(
      z.object({
        resume_role: z.string(),
        relevance: z.enum(["direct", "transferable", "unrelated"]),
        relevant_aspects: z.array(z.string()),
      })
    ),
    summary: z.string(),
  }),
});

export const claimMatchSchema = z.object({
  resumeFileName: z.string().min(1),
  resumeFileType: z.string().min(1),
  resumeFileSize: z.number().int().positive().max(5_242_880),
  resumeParsedData: parsedResumeSchema,
  jobDescriptionText: z.string().min(1),
  insights: insightsSchema,
});

export type ClaimMatchInput = z.infer<typeof claimMatchSchema>;
