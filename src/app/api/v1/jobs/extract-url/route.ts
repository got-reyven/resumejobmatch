import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { extractJobFromUrl } from "@/services/job-extraction-service";

// POST /api/v1/jobs/extract-url
// Fetches a public job posting URL and extracts the job description using AI
const extractUrlSchema = z.object({
  url: z
    .string()
    .url("Please provide a valid URL")
    .refine(
      (u) => u.startsWith("http://") || u.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = extractUrlSchema.parse(body);

    const result = await extractJobFromUrl(url);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
