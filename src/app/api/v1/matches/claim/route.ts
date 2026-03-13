import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimMatchSchema } from "@/lib/validations/claim-match";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";
import { persistMatch } from "@/services/match-persistence";

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

    const matchId = await persistMatch({
      supabase,
      userId: user.id,
      resumeFileName: payload.resumeFileName,
      resumeFileType: payload.resumeFileType,
      resumeFileSize: payload.resumeFileSize,
      resumeParsedData: payload.resumeParsedData as Record<string, unknown>,
      jobDescriptionText: payload.jobDescriptionText,
      jobSourceUrl: payload.jobSourceUrl,
      insights: payload.insights as unknown as Record<string, unknown>,
      overallScore: payload.insights.overallScore.overall,
    });

    return NextResponse.json({ data: { matchId } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
