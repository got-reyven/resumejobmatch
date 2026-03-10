import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/stats
// Returns public statistics (total match count) for the homepage counter
// Cached for 60 seconds to avoid hammering the DB
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: total, error } = await supabase.rpc("get_total_match_count");

    if (error) {
      console.error("Failed to fetch total match count:", error);
      return NextResponse.json(
        { data: { totalMatches: 0 } },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    return NextResponse.json(
      { data: { totalMatches: total ?? 0 } },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json({ data: { totalMatches: 0 } }, { status: 200 });
  }
}
