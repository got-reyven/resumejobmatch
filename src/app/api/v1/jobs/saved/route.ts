import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";

function extractTitle(rawText: string): string | null {
  const firstLine = rawText.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 120) return firstLine;
  return null;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { data, error } = await supabase
      .from("job_descriptions")
      .select("id, title, company, raw_text, source_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const seen = new Map<string, (typeof data)[number]>();
    for (const row of data) {
      const key =
        (row.title ?? extractTitle(row.raw_text) ?? row.id) +
        (row.company ?? "");
      if (!seen.has(key)) seen.set(key, row);
    }

    const jobs = Array.from(seen.values()).map((j) => ({
      id: j.id,
      title: j.title ?? extractTitle(j.raw_text),
      company: j.company,
      rawText: j.raw_text,
      sourceUrl: j.source_url,
      createdAt: j.created_at,
    }));

    return NextResponse.json({ data: jobs });
  } catch (error) {
    return handleApiError(error);
  }
}
