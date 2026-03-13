import { z } from "zod";
import { getAIProvider } from "@/services/ai/provider";
import { AppError } from "@/lib/errors/app-error";

const extractedJobSchema = z.object({
  title: z.string().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  jobDescription: z.string(),
});

type ExtractedJob = z.infer<typeof extractedJobSchema>;

const SYSTEM_PROMPT = `You are a job posting extraction specialist. Given the text content of a web page, extract the job posting information and return it as structured data.

Your task:
1. Identify the job posting content on the page (ignore navigation, footers, ads, cookie banners, and other non-job content).
2. Extract the job title, company name, location, and the full job description.
3. The jobDescription field should contain ALL relevant job posting text: role summary, responsibilities, requirements, qualifications, benefits, salary info, and any other job-specific details.
4. Format the jobDescription as clean, readable plain text with appropriate line breaks between sections.
5. Preserve section headers (e.g., "Requirements:", "Responsibilities:") as they appear in the original.
6. If the page does not contain a job posting, return the jobDescription as an empty string.`;

function buildExtractionPrompt(pageText: string): string {
  const truncated = pageText.slice(0, 15000);
  return `Extract the job posting from the following web page content:\n\n${truncated}`;
}

const MAX_FETCH_SIZE = 2 * 1024 * 1024; // 2MB
const FETCH_TIMEOUT_MS = 15000;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractJobFromUrl(url: string): Promise<ExtractedJob> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new AppError(
        `Failed to fetch the page (HTTP ${response.status}). The URL may be invalid, require authentication, or block automated access.`,
        "URL_FETCH_FAILED",
        422
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain") &&
      !contentType.includes("application/xhtml")
    ) {
      throw new AppError(
        "The URL does not point to an HTML page. Please provide a direct link to a job posting.",
        "INVALID_CONTENT_TYPE",
        422
      );
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_FETCH_SIZE) {
      throw new AppError(
        "The page is too large to process. Please paste the job description text directly.",
        "PAGE_TOO_LARGE",
        422
      );
    }

    html = await response.text();
  } catch (error) {
    if (error instanceof AppError) throw error;
    if ((error as Error).name === "AbortError") {
      throw new AppError(
        "The page took too long to load. Please paste the job description text directly.",
        "URL_TIMEOUT",
        422
      );
    }
    throw new AppError(
      "Could not reach the URL. Please check that it is valid and publicly accessible.",
      "URL_UNREACHABLE",
      422
    );
  } finally {
    clearTimeout(timeout);
  }

  const pageText = stripHtml(html);

  if (pageText.length < 50) {
    throw new AppError(
      "The page appears to be empty or requires JavaScript to render. Please paste the job description text directly.",
      "PAGE_EMPTY",
      422
    );
  }

  const provider = getAIProvider();
  const result = await provider.generateStructuredOutput<ExtractedJob>({
    systemPrompt: SYSTEM_PROMPT,
    prompt: buildExtractionPrompt(pageText),
    schema: extractedJobSchema,
    schemaName: "extracted_job",
    maxTokens: 3000,
    temperature: 0.1,
  });

  if (!result.jobDescription || result.jobDescription.trim().length < 20) {
    throw new AppError(
      "No job posting was found on this page. The page may require login, use JavaScript rendering, or not contain a job listing.",
      "NO_JOB_FOUND",
      422
    );
  }

  return result;
}
