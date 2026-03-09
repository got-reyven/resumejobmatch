import type { AIProvider } from "./types";
import { createOpenAIProvider } from "./openai-provider";
import { AppError } from "@/lib/errors/app-error";

type ProviderName = "openai" | "anthropic" | "google";

function getSystemKey(provider: ProviderName): string {
  switch (provider) {
    case "openai": {
      const key = process.env.OPENAI_API_KEY;
      if (!key)
        throw new AppError(
          "OpenAI API key not configured",
          "AI_CONFIG_ERROR",
          500
        );
      return key;
    }
    case "anthropic": {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key)
        throw new AppError(
          "Anthropic API key not configured",
          "AI_CONFIG_ERROR",
          500
        );
      return key;
    }
    case "google": {
      const key = process.env.GOOGLE_AI_API_KEY;
      if (!key)
        throw new AppError(
          "Google AI API key not configured",
          "AI_CONFIG_ERROR",
          500
        );
      return key;
    }
  }
}

function createProvider(
  name: ProviderName,
  apiKey: string,
  model?: string
): AIProvider {
  switch (name) {
    case "openai":
      return createOpenAIProvider({ apiKey, model });
    case "anthropic":
    case "google":
      throw new AppError(
        `${name} provider not yet implemented`,
        "AI_PROVIDER_NOT_IMPLEMENTED",
        501
      );
  }
}

export function getAIProvider(model?: string): AIProvider {
  const providerName = (process.env.AI_PROVIDER ?? "openai") as ProviderName;
  const apiKey = getSystemKey(providerName);
  return createProvider(providerName, apiKey, model);
}
