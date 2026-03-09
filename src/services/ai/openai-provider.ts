import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type {
  AIProvider,
  AIProviderConfig,
  StructuredOutputParams,
} from "./types";

const DEFAULT_MODEL = "gpt-4o-mini";

export function createOpenAIProvider(config: AIProviderConfig): AIProvider {
  const client = new OpenAI({ apiKey: config.apiKey });
  const model = config.model ?? DEFAULT_MODEL;

  return {
    name: "openai",
    defaultModel: model,

    async generateStructuredOutput<T>(
      params: StructuredOutputParams<T>
    ): Promise<T> {
      const completion = await client.chat.completions.parse({
        model: params.model ?? model,
        max_tokens: params.maxTokens ?? 2000,
        temperature: params.temperature ?? 0.1,
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.prompt },
        ],
        response_format: zodResponseFormat(params.schema, params.schemaName),
      });

      const message = completion.choices[0]?.message;

      if (message?.refusal) {
        throw new Error(`OpenAI refused the request: ${message.refusal}`);
      }

      const parsed = message?.parsed;
      if (!parsed) {
        throw new Error("OpenAI returned no structured output");
      }

      return parsed as T;
    },
  };
}
