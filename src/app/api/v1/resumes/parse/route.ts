import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/services/pdf-extractor";
import { parseResumeWithAI } from "@/services/ai/resume-ai-service";
import { handleApiError } from "@/lib/utils/api-error-handler";
import { ValidationError } from "@/lib/errors/app-error";
import { FILE_LIMITS } from "@/lib/constants/app";

// POST /api/v1/resumes/parse
// Accepts a PDF file via multipart form data, extracts text, and parses it with AI
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      throw new ValidationError("No file provided", {
        file: ["A PDF file is required"],
      });
    }

    if (file.size > FILE_LIMITS.maxSizeBytes) {
      throw new ValidationError("File too large", {
        file: [
          `Maximum file size is ${FILE_LIMITS.maxSizeBytes / (1024 * 1024)}MB`,
        ],
      });
    }

    const mimeType = file.type;
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (mimeType !== "application/pdf" && ext !== "pdf") {
      throw new ValidationError("Only PDF files are supported", {
        file: ["Please upload a .pdf file"],
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extracted = await extractTextFromPdf(buffer);
    const parsed = await parseResumeWithAI(extracted.text);

    return NextResponse.json(
      {
        data: {
          parsed,
          meta: {
            file_name: file.name,
            file_size: file.size,
            page_count: extracted.pageCount,
            text_length: extracted.text.length,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[resume-parse] Error:", error);
    return handleApiError(error);
  }
}
