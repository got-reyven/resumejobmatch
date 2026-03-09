import type { ParsedResume } from "@/lib/validations/parsed-resume";

export type InsightTab = "shared" | "jobseeker" | "hiring_manager";

export interface InsightResult<T> {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  tab: InsightTab;
  status: "success" | "partial" | "error";
  data: T;
  computedAt: string;
  modelUsed: string;
  tokensUsed: number;
}

export interface InsightComputeContext {
  resume: ParsedResume;
  jobDescription: string;
}

export interface InsightModule<T> {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  tab: InsightTab;
  compute(ctx: InsightComputeContext): Promise<InsightResult<T>>;
}

export interface MatchResult {
  overallScore: InsightResult<OverallScoreData>;
  skillsBreakdown: InsightResult<SkillsBreakdownData>;
  actionItems: InsightResult<ActionItemsData>;
  topStrengths: InsightResult<TopStrengthsData>;
}

export interface OverallScoreData {
  overall: number;
  dimensions: {
    skills: number;
    experience: number;
    qualifications: number;
    overall_fit: number;
  };
  summary: string;
}

export interface SkillsBreakdownData {
  matched: {
    skill: string;
    type: "exact" | "semantic";
    resume_term: string | null;
  }[];
  missing: {
    skill: string;
    priority: "required" | "preferred";
  }[];
  coverage_percent: number;
}

export interface ActionItemsData {
  actions: {
    priority: number;
    title: string;
    bullets: string[];
    section: string;
    impact: "high" | "medium";
  }[];
}

export interface TopStrengthsData {
  strengths: {
    area: string;
    evidence: string;
    relevance: string;
  }[];
}
