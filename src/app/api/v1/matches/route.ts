import { NextRequest, NextResponse } from "next/server";
import { matchRequestSchema } from "@/lib/validations/match-request";
import { runMatch } from "@/services/matching-service";
import { handleApiError } from "@/lib/utils/api-error-handler";

// POST /api/v1/matches
// Accepts parsed resume + job description text, returns match score with insights
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription } = matchRequestSchema.parse(body);

    const result = await runMatch({ resume, jobDescription });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
