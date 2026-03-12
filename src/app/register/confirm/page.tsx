"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 60;

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || !email) return;

    setResending(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setResent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-7 w-7 text-primary" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>

      <p className="mt-3 text-sm text-muted-foreground">
        We sent a magic link to{" "}
        <span className="font-medium text-foreground">
          {email || "your email"}
        </span>
        .
        <br />
        Click the link to continue your registration.
      </p>

      <div className="mt-8 space-y-3">
        <Button
          variant="outline"
          className="w-full"
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
        >
          {resending
            ? "Resending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend magic link"}
        </Button>

        {resent && (
          <p className="text-sm text-muted-foreground">
            A new link has been sent to your email.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Didn&apos;t receive an email? Check your spam folder.
      </p>
    </div>
  );
}
