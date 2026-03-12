import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";

// GET /api/v1/matches/stats?range=7|30
// Returns per-day match counts for the authenticated user over the given range.
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") ?? "7", 10);
    const days = range === 30 ? 30 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("matches")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .is("deleted_at", null)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    const countsByDate = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      countsByDate.set(d.toISOString().slice(0, 10), 0);
    }

    for (const row of data ?? []) {
      const dateKey = row.created_at.slice(0, 10);
      countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
    }

    const stats = Array.from(countsByDate.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({ data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
