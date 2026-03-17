"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  User,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

type UserType = "jobseeker" | "business";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("type") as UserType | null;
  const urlError = searchParams.get("error");

  const [handlingHash, setHandlingHash] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

    setHandlingHash(true);

    async function handleInviteRedirect() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setHandlingHash(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHandlingHash(false);
        return;
      }

      await fetch("/api/v1/profile");

      const meta = user.user_metadata ?? {};
      if (meta.invited_to_org) {
        router.replace("/accept-invite");
      } else {
        router.replace("/register/plan");
      }
    }

    handleInviteRedirect();
  }, [router]);

  const [userType, setUserType] = useState<UserType | null>(
    preselected === "jobseeker" || preselected === "business"
      ? preselected
      : null
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "auth_failed"
      ? "Authentication failed. Please try again."
      : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userType || !email || !password) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      localStorage.setItem("register_user_type", userType);

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError(
            "An account with this email already exists. Please sign in."
          );
        } else {
          setError(authError.message);
        }
        return;
      }

      if (!data.session) {
        setSuccess(true);
        return;
      }

      await fetch("/api/v1/profile");

      router.push("/register/plan");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (handlingHash) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        <p className="text-sm text-white/70">Completing sign in...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Registration successful!
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We&apos;ve sent a confirmation email to{" "}
          <span className="font-medium text-foreground">{email}</span>.
          <br />
          Please check your inbox and click the link to verify your account.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose how you&apos;ll use Resume Job Match
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1.5 block text-sm font-medium"
          >
            Confirm password
          </label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
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
          disabled={
            !userType || !email || !password || !confirmPassword || loading
          }
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
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
