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
