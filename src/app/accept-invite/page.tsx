"use client";

import { useEffect, useReducer, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Camera, Loader2, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface InviteState {
  status: "loading" | "ready" | "submitting" | "error" | "no_invite";
  email: string;
  orgName: string;
  fullName: string;
  avatarUrl: string | null;
  avatarUploading: boolean;
  error: string | null;
}

type InviteAction =
  | { type: "loaded"; email: string; orgName: string }
  | { type: "no_invite" }
  | { type: "set_name"; value: string }
  | { type: "avatar_uploading" }
  | { type: "avatar_uploaded"; url: string }
  | { type: "avatar_error"; message: string }
  | { type: "submitting" }
  | { type: "error"; message: string };

function reducer(state: InviteState, action: InviteAction): InviteState {
  switch (action.type) {
    case "loaded":
      return {
        ...state,
        status: "ready",
        email: action.email,
        orgName: action.orgName,
      };
    case "no_invite":
      return { ...state, status: "no_invite" };
    case "set_name":
      return { ...state, fullName: action.value, error: null };
    case "avatar_uploading":
      return { ...state, avatarUploading: true };
    case "avatar_uploaded":
      return { ...state, avatarUploading: false, avatarUrl: action.url };
    case "avatar_error":
      return {
        ...state,
        avatarUploading: false,
        error: action.message,
      };
    case "submitting":
      return { ...state, status: "submitting", error: null };
    case "error":
      return { ...state, status: "ready", error: action.message };
  }
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(reducer, {
    status: "loading",
    email: "",
    orgName: "",
    fullName: "",
    avatarUrl: null,
    avatarUploading: false,
    error: null,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        dispatch({ type: "no_invite" });
        return;
      }

      const meta = user.user_metadata ?? {};
      if (!meta.invited_to_org) {
        dispatch({ type: "no_invite" });
        return;
      }

      dispatch({
        type: "loaded",
        email: user.email ?? "",
        orgName: meta.invited_to_org_name ?? "your organization",
      });
    }
    load();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch({ type: "avatar_uploading" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        dispatch({
          type: "avatar_error",
          message: json?.error?.message ?? "Upload failed.",
        });
        return;
      }

      const json = await res.json();
      dispatch({ type: "avatar_uploaded", url: json.data.avatarUrl });
    } catch {
      dispatch({ type: "avatar_error", message: "Network error." });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.fullName.trim()) return;

    dispatch({ type: "submitting" });

    try {
      const res = await fetch("/api/v1/organization/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: state.fullName.trim() }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        dispatch({
          type: "error",
          message: json?.error?.message ?? "Failed to accept invite.",
        });
        return;
      }

      router.push("/dashboard");
    } catch {
      dispatch({ type: "error", message: "Network error. Please try again." });
    }
  };

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen bg-muted/30 p-3 sm:p-5">
        <div className="hero-box flex w-full flex-1 items-center justify-center overflow-hidden rounded-3xl py-24">
          <Loader2 className="h-8 w-8 animate-spin text-white/70" />
        </div>
      </div>
    );
  }

  if (state.status === "no_invite") {
    return (
      <div className="flex min-h-screen bg-muted/30 p-3 sm:p-5">
        <div className="hero-box flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-16">
          <Link href="/" className="mb-8" aria-label="Resume Job Match home">
            <Image
              src="/logo.svg"
              alt="Resume Job Match"
              width={260}
              height={50}
              priority
            />
          </Link>
          <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-bold">No Invitation Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link may have expired or already been used.
            </p>
            <Button className="mt-6" onClick={() => router.push("/")}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30 p-3 sm:p-5">
      <div className="hero-box flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-16">
        <Link href="/" className="mb-8" aria-label="Resume Job Match home">
          <Image
            src="/logo.svg"
            alt="Resume Job Match"
            width={260}
            height={50}
            priority
          />
        </Link>
        <div className="mx-auto w-full max-w-md rounded-xl bg-white p-8">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Join {state.orgName}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete your profile to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="rounded-md border border-gray-200 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {state.email}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Organization</Label>
              <div className="rounded-md border border-gray-200 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                {state.orgName}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-muted">
                    {state.avatarUrl ? (
                      <Image
                        src={state.avatarUrl}
                        alt="Avatar"
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#6696C9] text-white transition-colors hover:bg-[#5580b0] disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={state.avatarUploading}
                    aria-label="Upload avatar"
                  >
                    {state.avatarUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Camera className="h-3 w-3" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Optional</p>
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={state.fullName}
                  onChange={(e) =>
                    dispatch({ type: "set_name", value: e.target.value })
                  }
                  placeholder="Your full name"
                  maxLength={100}
                  required
                  disabled={state.status === "submitting"}
                />
              </div>
            </div>

            {state.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!state.fullName.trim() || state.status === "submitting"}
            >
              {state.status === "submitting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join & Go to Dashboard"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
