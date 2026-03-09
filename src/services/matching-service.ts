import type { ParsedResume } from "@/lib/validations/parsed-resume";
import type { MatchResult } from "./insights/types";
import { computeOverallScore } from "./insights/overall-score/compute";
import { computeSkillsBreakdown } from "./insights/skills-breakdown/compute";
import { computeActionItems } from "./insights/action-items/compute";
import { computeTopStrengths } from "./insights/top-strengths/compute";

export interface MatchInput {
  resume: ParsedResume;
  jobDescription: string;
}

export async function runMatch(input: MatchInput): Promise<MatchResult> {
  const ctx = {
    resume: input.resume,
    jobDescription: input.jobDescription,
  };

  const [overallScore, skillsBreakdown, actionItems, topStrengths] =
    await Promise.all([
      computeOverallScore(ctx),
      computeSkillsBreakdown(ctx),
      computeActionItems(ctx),
      computeTopStrengths(ctx),
    ]);

  return { overallScore, skillsBreakdown, actionItems, topStrengths };
}
