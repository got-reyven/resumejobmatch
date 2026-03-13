import type { ParsedResume } from "@/lib/validations/parsed-resume";
import type { MatchResult } from "./insights/types";
import { computeOverallScore } from "./insights/overall-score/compute";
import { computeSkillsBreakdown } from "./insights/skills-breakdown/compute";
import { computeActionItems } from "./insights/action-items/compute";
import { computeTopStrengths } from "./insights/top-strengths/compute";
import { computeATSKeywords } from "./insights/ats-keywords/compute";
import { computeExperienceAlignment } from "./insights/experience-alignment/compute";

export interface MatchInput {
  resume: ParsedResume;
  jobDescription: string;
}

/**
 * Runs the core matching pipeline (6 insights).
 * Additional insights (e.g. Qualification Fit) are computed on-demand
 * via the /api/v1/matches/[id]/insights endpoint.
 */
export async function runMatch(input: MatchInput): Promise<MatchResult> {
  const ctx = {
    resume: input.resume,
    jobDescription: input.jobDescription,
  };

  const [
    overallScore,
    skillsBreakdown,
    actionItems,
    topStrengths,
    atsKeywords,
    experienceAlignment,
  ] = await Promise.all([
    computeOverallScore(ctx),
    computeSkillsBreakdown(ctx),
    computeActionItems(ctx),
    computeTopStrengths(ctx),
    computeATSKeywords(ctx),
    computeExperienceAlignment(ctx),
  ]);

  return {
    overallScore,
    skillsBreakdown,
    actionItems,
    topStrengths,
    atsKeywords,
    experienceAlignment,
  };
}
