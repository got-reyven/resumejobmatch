import { AppError } from "@/lib/errors/app-error";

interface ResilienceOptions<T> {
  maxRetries?: number;
  timeoutMs?: number;
  fallback?: () => T;
}

export async function withAIResilience<T>(
  fn: () => Promise<T>,
  options: ResilienceOptions<T> = {}
): Promise<T> {
  const { maxRetries = 2, timeoutMs = 30000, fallback } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(new AppError("AI request timed out", "AI_TIMEOUT", 504)),
            timeoutMs
          )
        ),
      ]);
      return result;
    } catch (error) {
      const isRetryable =
        error instanceof Error &&
        ("status" in error
          ? [429, 500, 502, 503].includes((error as { status: number }).status)
          : error.message.includes("timed out"));

      if (attempt === maxRetries || !isRetryable) {
        if (fallback) return fallback();
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new AppError("AI service unavailable", "AI_UNAVAILABLE", 503);
}
