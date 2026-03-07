import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverEnvSchema = envSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  API_KEY_ENCRYPTION_SECRET: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]+$/i)
    .describe("32-byte hex key for AES-256-GCM encryption of user API keys"),
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
