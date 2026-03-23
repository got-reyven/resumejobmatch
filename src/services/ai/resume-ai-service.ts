import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { withAIResilience } from "./utils/resilience";
import { buildResumeParsingPrompt } from "./prompts/resume-parsing";
import {
  parsedResumeSchema,
  type ParsedResume,
} from "@/lib/validations/parsed-resume";
import { AppError } from "@/lib/errors/app-error";

const MODEL = "gpt-4o-mini";

export async function parseResumeWithAI(
  resumeText: string,
  pdfBuffer?: Buffer
): Promise<ParsedResume> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    throw new AppError("OpenAI API key not configured", "AI_CONFIG_ERROR", 500);

  const client = new OpenAI({ apiKey });
  const { systemPrompt } = buildResumeParsingPrompt(resumeText);

  return withAIResilience(
    async () => {
      const contentParts: OpenAI.Responses.ResponseInputContent[] = [];

      if (pdfBuffer) {
        const base64 = pdfBuffer.toString("base64");
        contentParts.push({
          type: "input_file",
          filename: "resume.pdf",
          file_data: `data:application/pdf;base64,${base64}`,
        });
        contentParts.push({
          type: "input_text",
          text: "Parse this resume PDF and extract all structured data. Pay special attention to the candidate's name, email, phone number, and location — these are typically at the top of the document.",
        });
      } else {
        contentParts.push({
          type: "input_text",
          text: `Parse this resume and extract structured data:\n\n---\n${resumeText}\n---`,
        });
      }

      const response = await client.responses.parse({
        model: MODEL,
        instructions: systemPrompt,
        input: [{ role: "user", content: contentParts }],
        text: { format: zodTextFormat(parsedResumeSchema, "parsed_resume") },
        max_output_tokens: 4096,
        temperature: 0.1,
      });

      const parsed = response.output_parsed;
      if (!parsed) {
        console.error("[resume-parse] No parsed output from Responses API");
        throw new Error("OpenAI returned no structured output");
      }

      return parsed;
    },
    { maxRetries: 2, timeoutMs: 60000 }
  );
}
