import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimMatchSchema } from "@/lib/validations/claim-match";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";

const INSIGHT_META: Record<
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
};

// POST /api/v1/matches/claim
// Persists a guest user's match results into their account after authentication
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const body = await request.json();
    const payload = claimMatchSchema.parse(body);

    const fileExt = payload.resumeFileName.split(".").pop()?.toLowerCase();
    const fileType = fileExt === "docx" ? "docx" : "pdf";

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        file_name: payload.resumeFileName,
        file_type: fileType,
        file_size: payload.resumeFileSize,
        storage_path: null,
        raw_text: null,
        parsed_data: payload.resumeParsedData,
        is_parsed: true,
      })
      .select("id")
      .single();

    if (resumeError) throw resumeError;

    const { data: jobDesc, error: jobDescError } = await supabase
      .from("job_descriptions")
      .insert({
        user_id: user.id,
        raw_text: payload.jobDescriptionText,
      })
      .select("id")
      .single();

    if (jobDescError) throw jobDescError;

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .insert({
        user_id: user.id,
        resume_id: resume.id,
        job_description_id: jobDesc.id,
        overall_score: payload.insights.overallScore.overall,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (matchError) throw matchError;

    const insightRows = Object.entries(payload.insights).map(([key, data]) => {
      const meta = INSIGHT_META[key];
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

    return NextResponse.json({ data: { matchId: match.id } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
