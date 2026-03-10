import { NextRequest, NextResponse } from "next/server";
import { matchRequestSchema } from "@/lib/validations/match-request";
import { runMatch } from "@/services/matching-service";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { getIpHash } from "@/lib/utils/ip-hash";
import { RATE_LIMITS } from "@/lib/constants/app";

// POST /api/v1/matches
// Accepts parsed resume + job description text, returns match score with insights
// Tracks usage for both authenticated and anonymous users
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isGuest = !user;
    const ipHash = isGuest ? getIpHash(request) : null;

    if (isGuest && ipHash) {
      const { data: count } = await supabase.rpc("get_usage_count", {
        p_ip_hash: ipHash,
      });

      if ((count ?? 0) >= RATE_LIMITS.guest.dailyMatches) {
        throw new AppError(
          `Daily limit of ${RATE_LIMITS.guest.dailyMatches} matches reached. Register for free to get more.`,
          "RATE_LIMITED",
          429
        );
      }
    }

    const body = await request.json();
    const { resume, jobDescription } = matchRequestSchema.parse(body);

    const result = await runMatch({ resume, jobDescription });

    if (isGuest && ipHash) {
      await supabase.rpc("increment_usage", { p_ip_hash: ipHash });
    } else if (user) {
      await supabase.rpc("increment_usage", { p_user_id: user.id });
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
