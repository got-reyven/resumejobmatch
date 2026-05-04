import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";

/**
 * GET /api/v1/matches/compare
 * Returns all completed matches for the authenticated user with their
 * resume names, JD titles, and available insight keys. Used by the
 * Comparison module to populate selectors and the insight matrix.
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { data: matches, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        overall_score,
        created_at,
        resumes!inner (
          id,
          file_name,
          parsed_data
        ),
        job_descriptions!inner (
          id,
          title,
          company,
          raw_text
        ),
        match_insights (
          insight_key,
          data
        )
      `
      )
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const items = (matches ?? []).map((m) => {
      const resume = Array.isArray(m.resumes) ? m.resumes[0] : m.resumes;
      const job = Array.isArray(m.job_descriptions)
        ? m.job_descriptions[0]
        : m.job_descriptions;

      const parsedName =
        (resume?.parsed_data as Record<string, unknown>)?.name ?? null;

      const insightMap: Record<string, unknown> = {};
      for (const ins of m.match_insights ?? []) {
        insightMap[ins.insight_key] = ins.data;
      }

      return {
        id: m.id,
        overallScore: m.overall_score,
        createdAt: m.created_at,
        resumeId: resume?.id ?? null,
        resumeFileName: resume?.file_name ?? "Unknown",
        candidateName: parsedName as string | null,
        jobDescriptionId: job?.id ?? null,
        jobTitle: job?.title ?? extractTitle(job?.raw_text ?? ""),
        jobCompany: job?.company ?? null,
        insights: insightMap,
      };
    });

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

function extractTitle(rawText: string): string | null {
  const firstLine = rawText.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 120) return firstLine;
  return null;
}
