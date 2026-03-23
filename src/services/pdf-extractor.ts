import { ValidationError } from "@/lib/errors/app-error";

export interface ExtractedText {
  text: string;
  pageCount: number;
}

export async function extractTextFromPdf(
  buffer: Buffer
): Promise<ExtractedText> {
  try {
    const { extractText, getDocumentProxy } = await import("unpdf");

    const uint8 = new Uint8Array(buffer);
    const pdf = await getDocumentProxy(uint8);
    const { totalPages, text } = await extractText(pdf, { mergePages: true });

    const cleaned = (text as string).trim();

    if (!cleaned) {
      throw new ValidationError("The PDF appears to be empty or image-based.", {
        file: ["No extractable text found in the PDF"],
      });
    }

    return { text: cleaned, pageCount: totalPages };
  } catch (error) {
    if (error instanceof ValidationError) throw error;

    console.error("PDF extraction failed:", error);

    throw new ValidationError("Unable to read this PDF file.", {
      file: ["The file may be corrupted or password-protected"],
    });
  }
}
