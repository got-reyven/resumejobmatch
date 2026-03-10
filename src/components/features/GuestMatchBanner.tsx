"use client";

import { useState } from "react";
import { Save, X, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getGuestMatch,
  clearGuestMatch,
  type GuestMatchData,
} from "@/lib/guest-match-storage";

type BannerState = "idle" | "visible" | "saving" | "saved" | "error";

export function GuestMatchBanner() {
  const [guestData] = useState<GuestMatchData | null>(() => {
    if (typeof window === "undefined") return null;
    return getGuestMatch();
  });
  const [state, setState] = useState<BannerState>(() =>
    guestData ? "visible" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSave() {
    if (!guestData) return;

    setState("saving");
    setErrorMsg(null);

    try {
      const { createdAt: _, ...payload } = guestData;

      const res = await fetch("/api/v1/matches/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        setErrorMsg(json.error?.message ?? "Failed to save. Please try again.");
        setState("error");
        return;
      }

      clearGuestMatch();
      setState("saved");
    } catch {
      setErrorMsg("Network error. Please check your connection and retry.");
      setState("error");
    }
  }

  function handleDismiss() {
    clearGuestMatch();
    setState("idle");
  }

  if (state === "idle") return null;

  if (state === "saved") {
    return (
      <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="flex items-center gap-3 py-4">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Match results saved to your account!
          </p>
        </CardContent>
      </Card>
    );
  }

  const score = guestData?.insights.overallScore.overall ?? 0;
  const timestamp = guestData
    ? new Date(guestData.createdAt).toLocaleString()
    : "";

  return (
    <Card className="mb-8 border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Save className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">
              You have unsaved match results from your guest session
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Score: {score}% &middot; {timestamp}
            </p>
            {state === "error" && errorMsg && (
              <p className="mt-1 text-xs text-destructive">{errorMsg}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            disabled={state === "saving"}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={state === "saving"}
            className="gap-1.5"
          >
            {state === "saving" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save to Account
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
