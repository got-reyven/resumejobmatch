import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";

// GET /api/v1/matches/history?page=1&pageSize=20&q=search
// Returns paginated match history for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10))
    );
    const query = searchParams.get("q")?.trim() ?? "";

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let matchQuery = supabase
      .from("matches")
      .select(
        `
        id,
        overall_score,
        status,
        created_at,
        completed_at,
        resumes!inner (
          id,
          file_name,
          parsed_data
        ),
        job_descriptions!inner (
          id,
          title,
          company,
          raw_text,
          source_url
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (query) {
      matchQuery = matchQuery.or(
        `resumes.file_name.ilike.%${query}%,job_descriptions.title.ilike.%${query}%,job_descriptions.company.ilike.%${query}%,job_descriptions.raw_text.ilike.%${query}%`
      );
    }

    const { data: matches, count, error } = await matchQuery;

    if (error) throw error;

    const items = (matches ?? []).map((m) => {
      const resume = Array.isArray(m.resumes) ? m.resumes[0] : m.resumes;
      const job = Array.isArray(m.job_descriptions)
        ? m.job_descriptions[0]
        : m.job_descriptions;

      const parsedName =
        (resume?.parsed_data as Record<string, unknown>)?.name ?? null;
      const jobTitle = job?.title ?? extractTitle(job?.raw_text ?? "");
      const jobCompany = job?.company ?? null;

      return {
        id: m.id,
        overallScore: m.overall_score,
        resumeFileName: resume?.file_name ?? "Unknown",
        candidateName: parsedName,
        jobTitle,
        jobCompany,
        jobSourceUrl: job?.source_url ?? null,
        createdAt: m.created_at,
        completedAt: m.completed_at,
      };
    });

    return NextResponse.json(
      {
        data: items,
        meta: {
          total: count ?? 0,
          page,
          pageSize,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

function extractTitle(rawText: string): string | null {
  const firstLine = rawText.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 120) return firstLine;
  return null;
}
