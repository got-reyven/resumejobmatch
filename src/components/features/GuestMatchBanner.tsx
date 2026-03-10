"use client";

import { useEffect, useReducer } from "react";
import { Save, X, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getGuestMatch,
  clearGuestMatch,
  type GuestMatchData,
} from "@/lib/guest-match-storage";

interface BannerState {
  guestData: GuestMatchData | null;
  status: "idle" | "visible" | "saving" | "saved" | "error";
  errorMsg: string | null;
}

type BannerAction =
  | { type: "loaded"; data: GuestMatchData }
  | { type: "saving" }
  | { type: "saved" }
  | { type: "error"; message: string }
  | { type: "dismiss" };

function bannerReducer(state: BannerState, action: BannerAction): BannerState {
  switch (action.type) {
    case "loaded":
      return { ...state, guestData: action.data, status: "visible" };
    case "saving":
      return { ...state, status: "saving", errorMsg: null };
    case "saved":
      return { ...state, status: "saved" };
    case "error":
      return { ...state, status: "error", errorMsg: action.message };
    case "dismiss":
      return { ...state, status: "idle" };
  }
}

export function GuestMatchBanner() {
  const [state, dispatch] = useReducer(bannerReducer, {
    guestData: null,
    status: "idle",
    errorMsg: null,
  });

  useEffect(() => {
    const data = getGuestMatch();
    if (data) {
      dispatch({ type: "loaded", data });
    }
  }, []);

  if (state.status === "idle") return null;

  if (state.status === "saved") {
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

  const score = state.guestData?.insights.overallScore.overall ?? 0;
  const timestamp = state.guestData
    ? new Date(state.guestData.createdAt).toLocaleString()
    : "";

  async function handleSave() {
    if (!state.guestData) return;

    dispatch({ type: "saving" });

    try {
      const { createdAt: _, ...payload } = state.guestData;

      const res = await fetch("/api/v1/matches/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        dispatch({
          type: "error",
          message: json.error?.message ?? "Failed to save. Please try again.",
        });
        return;
      }

      clearGuestMatch();
      dispatch({ type: "saved" });
    } catch {
      dispatch({
        type: "error",
        message: "Network error. Please check your connection and retry.",
      });
    }
  }

  function handleDismiss() {
    clearGuestMatch();
    dispatch({ type: "dismiss" });
  }

  return (
    <Card className="mb-8 border-[#6696C9] bg-[#B5DAF2]/30">
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
            {state.status === "error" && state.errorMsg && (
              <p className="mt-1 text-xs text-destructive">{state.errorMsg}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
            disabled={state.status === "saving"}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Dismiss
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={state.status === "saving"}
            className="gap-1.5"
          >
            {state.status === "saving" ? (
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
