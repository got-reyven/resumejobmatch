import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverEnvSchema = envSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AI_PROVIDER: z.enum(["openai", "anthropic", "google"]).default("openai"),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  GOOGLE_AI_API_KEY: z.string().min(1).optional(),
});

function createEnv() {
  if (typeof window !== "undefined") {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    });
  }

  return serverEnvSchema.parse(process.env);
}

export type Env = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof envSchema>;

export const env = createEnv();
