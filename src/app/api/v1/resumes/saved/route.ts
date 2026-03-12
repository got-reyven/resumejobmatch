import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { AuthenticationError } from "@/lib/errors/app-error";

// GET /api/v1/resumes/saved
// Returns deduplicated list of parsed resumes for the authenticated user.
// Groups by file_name and returns the most recently created entry.
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { data, error } = await supabase
      .from("resumes")
      .select("id, file_name, file_size, parsed_data, created_at")
      .eq("user_id", user.id)
      .eq("is_parsed", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const seen = new Map<string, (typeof data)[number]>();
    for (const row of data) {
      if (!seen.has(row.file_name)) {
        seen.set(row.file_name, row);
      }
    }

    const resumes = Array.from(seen.values()).map((r) => ({
      id: r.id,
      fileName: r.file_name,
      fileSize: r.file_size,
      parsedData: r.parsed_data,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ data: resumes });
  } catch (error) {
    return handleApiError(error);
  }
}
