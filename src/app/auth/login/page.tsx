"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (authError) {
        if (authError.message.includes("Signups not allowed")) {
          setError("No account found with this email. Please register first.");
        } else {
          setError(authError.message);
        }
        return;
      }

      setSent(true);
      setCooldown(60);
      startCooldown();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function startCooldown() {
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      setCooldown(60);
      startCooldown();
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
        <Link href="/" className="mb-8" aria-label="Resume Job Match home">
          <Image
            src="/logo.svg"
            alt="Resume Job Match"
            width={260}
            height={50}
            priority
          />
        </Link>

        <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Check your email
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a magic link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
            <br />
            Click the link to sign in.
          </p>

          <div className="mt-8 space-y-3">
            <Button
              variant="outline"
              className="w-full"
              disabled={cooldown > 0 || loading}
              onClick={handleResend}
            >
              {loading
                ? "Resending..."
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend magic link"}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setSent(false)}
            >
              Use a different email
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Didn&apos;t receive an email? Check your spam folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="mb-8" aria-label="Resume Job Match home">
        <Image
          src="/logo.svg"
          alt="Resume Job Match"
          width={260}
          height={50}
          priority
        />
      </Link>

      <div className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your email — no password needed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={!email || loading}>
            {loading ? "Sending magic link..." : "Send Magic Link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
