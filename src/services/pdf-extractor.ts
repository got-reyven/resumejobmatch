import { ValidationError } from "@/lib/errors/app-error";

export interface ExtractedText {
  text: string;
  pageCount: number;
}

export async function extractTextFromPdf(
  buffer: Buffer
): Promise<ExtractedText> {
  try {
    // Import from lib/pdf-parse directly to bypass the index.js test runner
    // that tries to open a non-existent test file when module.parent is falsy
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const data = await pdfParse(buffer);

    const text = data.text?.trim() ?? "";
    if (!text) {
      throw new ValidationError("The PDF appears to be empty or image-based.", {
        file: ["No extractable text found in the PDF"],
      });
    }

    return {
      text,
      pageCount: data.numpages,
    };
  } catch (error) {
    if (error instanceof ValidationError) throw error;

    console.error("PDF extraction failed:", error);

    throw new ValidationError("Unable to read this PDF file.", {
      file: ["The file may be corrupted or password-protected"],
    });
  }
}
