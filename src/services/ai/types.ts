import type { z } from "zod";

export interface StructuredOutputParams<T> {
  systemPrompt: string;
  prompt: string;
  schema: z.ZodType<T>;
  schemaName: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AIProvider {
  generateStructuredOutput<T>(params: StructuredOutputParams<T>): Promise<T>;
  readonly name: string;
  readonly defaultModel: string;
}

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
}
