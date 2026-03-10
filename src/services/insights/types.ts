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
  atsKeywords: InsightResult<ATSKeywordsData>;
  experienceAlignment: InsightResult<ExperienceAlignmentData>;
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

export interface ExperienceAlignmentData {
  total_relevant_years: number;
  required_years: number | null;
  seniority_fit: "under" | "match" | "over";
  industry_alignment: "same" | "adjacent" | "different";
  role_mapping: {
    resume_role: string;
    relevance: "direct" | "transferable" | "unrelated";
    relevant_aspects: string[];
  }[];
  summary: string;
}

export interface ATSKeywordsData {
  keywords: {
    keyword: string;
    category: "technical" | "tool" | "certification" | "soft_skill" | "other";
    found_in_resume: boolean;
    match_type: "exact" | "semantic" | "missing";
    resume_context: string | null;
  }[];
  ats_pass_likelihood: "high" | "medium" | "low";
  suggestion: string;
}
