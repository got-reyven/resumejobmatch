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
  qualificationFit?: InsightResult<QualificationFitData>;
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

export interface QualificationFitData {
  qualifications: {
    requirement: string;
    type: "required" | "preferred";
    status: "met" | "partially_met" | "not_found";
    evidence: string | null;
    note: string | null;
  }[];
  summary: string;
}

export interface SectionStrengthData {
  sections: {
    name:
      | "summary"
      | "skills"
      | "experience"
      | "education"
      | "certifications"
      | "other";
    score: number;
    feedback: string;
    suggestion: string | null;
  }[];
  weakest: string;
  summary: string;
}

export interface TailoredSummaryData {
  current_summary: string | null;
  suggested_summary: string;
  key_changes: string[];
}

export interface RiskAreasData {
  risks: {
    area: string;
    severity: "critical" | "moderate" | "minor";
    detail: string;
    mitigation: string | null;
  }[];
  summary: string;
}

export interface InterviewFocusData {
  questions: {
    question: string;
    rationale: string;
    category: "technical" | "experience" | "culture" | "growth";
    listen_for: string;
  }[];
}

export interface OverqualificationData {
  is_overqualified: boolean;
  confidence: "high" | "moderate" | "low";
  indicators: string[];
  recommendation: string;
}

export interface RewriteSuggestionsData {
  rewrites: {
    original: string;
    suggested: string;
    rationale: string;
    section: string;
  }[];
}

export interface ResumeIntegrityData {
  risk_level: "none" | "low" | "medium" | "high";
  is_clean: boolean;
  findings: {
    type:
      | "score_inflation"
      | "instruction_override"
      | "ranking_manipulation"
      | "system_prompt_leak"
      | "role_hijack"
      | "suspicious_content";
    description: string;
    excerpt: string;
    severity: "warning" | "critical";
  }[];
  summary: string;
  recommendation: string;
}

export interface CompetitivePositioningData {
  positioning: string;
  confidence: "high" | "moderate" | "low";
  strong_areas: string[];
  weak_areas: string[];
  recommendation: string;
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
