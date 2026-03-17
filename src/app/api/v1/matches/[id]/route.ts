import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError, NotFoundError } from "@/lib/errors/app-error";

type RouteContext = { params: Promise<{ id: string }> };

function extractTitle(rawText: string): string | null {
  const firstLine = rawText.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 120) return firstLine;
  return null;
}

// GET /api/v1/matches/[id]
// Returns a single match with all insights for the authenticated user
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { id } = await context.params;

    const { data: match, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        overall_score,
        status,
        created_at,
        completed_at,
        resumes (
          id,
          file_name,
          file_type,
          file_size,
          parsed_data
        ),
        job_descriptions (
          id,
          title,
          company,
          raw_text,
          source_url
        ),
        match_insights (
          insight_key,
          tab,
          tier,
          title,
          data
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (error || !match) throw new NotFoundError("Match");

    const resume = Array.isArray(match.resumes)
      ? match.resumes[0]
      : match.resumes;
    const job = Array.isArray(match.job_descriptions)
      ? match.job_descriptions[0]
      : match.job_descriptions;

    const insights: Record<string, unknown> = {};
    for (const insight of match.match_insights ?? []) {
      insights[insight.insight_key] = insight.data;
    }

    return NextResponse.json(
      {
        data: {
          id: match.id,
          overallScore: match.overall_score,
          status: match.status,
          createdAt: match.created_at,
          completedAt: match.completed_at,
          resume: {
            fileName: resume?.file_name,
            fileType: resume?.file_type,
            fileSize: resume?.file_size,
            parsedData: resume?.parsed_data,
          },
          jobDescription: {
            title: job?.title ?? extractTitle(job?.raw_text ?? ""),
            company: job?.company,
            rawText: job?.raw_text,
            sourceUrl: job?.source_url ?? null,
          },
          insights,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/v1/matches/[id]
// Updates match metadata (currently: job title)
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { id } = await context.params;
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : null;

    if (title === null || title.length === 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Title is required" } },
        { status: 400 }
      );
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("job_description_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (matchError || !match) throw new NotFoundError("Match");

    const { error: updateError } = await supabase
      .from("job_descriptions")
      .update({ title })
      .eq("id", match.job_description_id)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ data: { title } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/v1/matches/[id]
// Soft-deletes a match by setting deleted_at
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { id } = await context.params;

    const { error } = await supabase
      .from("matches")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
