import type { SupabaseClient } from "@supabase/supabase-js";

export const INSIGHT_META: Record<
  string,
  {
    tab: "shared" | "jobseeker" | "hiring_manager";
    tier: number;
    title: string;
  }
> = {
  overallScore: { tab: "shared", tier: 1, title: "Overall Match Score" },
  skillsBreakdown: { tab: "shared", tier: 1, title: "Skills Match Breakdown" },
  actionItems: { tab: "jobseeker", tier: 1, title: "Top 3 Action Items" },
  topStrengths: { tab: "hiring_manager", tier: 1, title: "Top Strengths" },
  atsKeywords: { tab: "jobseeker", tier: 1, title: "ATS Keyword Analysis" },
  experienceAlignment: {
    tab: "shared",
    tier: 1,
    title: "Experience Alignment",
  },
  qualificationFit: {
    tab: "shared",
    tier: 2,
    title: "Qualification Fit",
  },
  sectionStrength: {
    tab: "jobseeker",
    tier: 2,
    title: "Resume Section Strength",
  },
  tailoredSummary: {
    tab: "jobseeker",
    tier: 2,
    title: "Tailored Summary Suggestion",
  },
  riskAreas: {
    tab: "hiring_manager",
    tier: 2,
    title: "Risk Areas & Gaps",
  },
  interviewFocus: {
    tab: "hiring_manager",
    tier: 2,
    title: "Interview Focus Points",
  },
  overqualification: {
    tab: "hiring_manager",
    tier: 2,
    title: "Overqualification Assessment",
  },
  rewriteSuggestions: {
    tab: "jobseeker",
    tier: 2,
    title: "Rewrite Suggestions",
  },
  resumeIntegrity: {
    tab: "hiring_manager",
    tier: 2,
    title: "Resume Integrity Check",
  },
  competitivePositioning: {
    tab: "jobseeker",
    tier: 2,
    title: "Competitive Positioning",
  },
};

interface PersistMatchParams {
  supabase: SupabaseClient;
  userId: string;
  resumeFileName: string;
  resumeFileType: string;
  resumeFileSize: number;
  resumeParsedData: Record<string, unknown>;
  jobDescriptionText: string;
  jobSourceUrl?: string | null;
  insights: Record<string, unknown>;
  overallScore: number;
}

function extractTitle(rawText: string): string | null {
  const firstLine = rawText.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 120) return firstLine;
  return null;
}

export async function persistMatch({
  supabase,
  userId,
  resumeFileName,
  resumeFileType: _resumeFileType,
  resumeFileSize,
  resumeParsedData,
  jobDescriptionText,
  jobSourceUrl,
  insights,
  overallScore,
}: PersistMatchParams): Promise<string> {
  const fileExt = resumeFileName.split(".").pop()?.toLowerCase();
  const fileType = fileExt === "docx" ? "docx" : "pdf";

  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      file_name: resumeFileName,
      file_type: fileType,
      file_size: resumeFileSize,
      storage_path: null,
      raw_text: null,
      parsed_data: resumeParsedData,
      is_parsed: true,
    })
    .select("id")
    .single();

  if (resumeError) throw resumeError;

  const { data: jobDesc, error: jobDescError } = await supabase
    .from("job_descriptions")
    .insert({
      user_id: userId,
      title: extractTitle(jobDescriptionText),
      raw_text: jobDescriptionText,
      source_url: jobSourceUrl ?? null,
    })
    .select("id")
    .single();

  if (jobDescError) throw jobDescError;

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      user_id: userId,
      resume_id: resume.id,
      job_description_id: jobDesc.id,
      overall_score: overallScore,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (matchError) throw matchError;

  const insightRows = Object.entries(insights)
    .filter(([key]) => INSIGHT_META[key] !== undefined)
    .map(([key, data]) => {
      const meta = INSIGHT_META[key]!;
      return {
        match_id: match.id,
        insight_key: key,
        tab: meta.tab,
        tier: meta.tier,
        title: meta.title,
        data,
      };
    });

  const { error: insightsError } = await supabase
    .from("match_insights")
    .insert(insightRows);

  if (insightsError) throw insightsError;

  return match.id;
}
