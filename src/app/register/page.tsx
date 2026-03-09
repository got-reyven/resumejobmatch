"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

type UserType = "jobseeker" | "business";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("type") as UserType | null;
  const urlError = searchParams.get("error");

  const [userType, setUserType] = useState<UserType | null>(
    preselected === "jobseeker" || preselected === "business"
      ? preselected
      : null
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "auth_failed"
      ? "Authentication failed. Please try again."
      : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userType || !email) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      localStorage.setItem("register_user_type", userType);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const params = new URLSearchParams({ email, type: userType });
      router.push(`/register/confirm?${params.toString()}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-background p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose how you&apos;ll use Resume Job Match
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium">
            I am registering as
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <UserTypeOption
              type="jobseeker"
              label="Job Seeker"
              description="Find the right job"
              icon={<User className="h-5 w-5" />}
              selected={userType === "jobseeker"}
              onSelect={() => setUserType("jobseeker")}
            />
            <UserTypeOption
              type="business"
              label="Business"
              description="Find the right talent"
              icon={<Briefcase className="h-5 w-5" />}
              selected={userType === "business"}
              onSelect={() => setUserType("business")}
            />
          </div>
        </fieldset>

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

        <Button
          type="submit"
          className="w-full"
          disabled={!userType || !email || loading}
        >
          {loading ? "Sending magic link..." : "Continue"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll send you a magic link — no password needed.
        </p>
      </form>
    </div>
  );
}

function UserTypeOption({
  label,
  description,
  icon,
  selected,
  onSelect,
}: {
  type: UserType;
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-muted-foreground/30"
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          "rounded-full p-2",
          selected ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}
