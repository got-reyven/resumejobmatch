"use client";

import Link from "next/link";
import { Clock, Lock, Crown, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CareerGapDisplayProps {
  gaps: {
    from: string;
    to: string;
    duration_months: number;
    possible_context: string | null;
  }[];
  has_significant_gaps: boolean;
  summary: string;
  isPro?: boolean;
}

export function CareerGapDisplay({
  gaps,
  has_significant_gaps,
  summary,
  isPro = false,
}: CareerGapDisplayProps) {
  const totalMonths = gaps.reduce((sum, g) => sum + g.duration_months, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-violet-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Career Gap Analysis</h3>
      </div>

      {/* Status banner */}
      {has_significant_gaps ? (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {gaps.length} gap{gaps.length !== 1 ? "s" : ""} detected
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              ~{totalMonths} month{totalMonths !== 1 ? "s" : ""} of total gap
              time identified
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              No significant gaps
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Employment timeline looks continuous
            </p>
          </div>
        </div>
      )}

      {/* Gap details — Pro only */}
      {isPro && gaps.length > 0 && (
        <div className="space-y-2">
          {gaps.map((gap, i) => (
            <div key={i} className="rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {gap.from} — {gap.to}
                </span>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                  {gap.duration_months} month
                  {gap.duration_months !== 1 ? "s" : ""}
                </span>
              </div>
              {gap.possible_context && (
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Possible context: {gap.possible_context}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Free teaser — show gap count but not details */}
      {!isPro && gaps.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Upgrade to Pro for full gap details
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                See exact dates, durations, and possible explanations for each
                career gap — plus actionable advice on how to address them.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-2.5 gap-1.5 bg-amber-600 text-xs hover:bg-amber-700"
              >
                <Link href="/pricing">
                  <Crown className="h-3.5 w-3.5" />
                  Upgrade to Pro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  );
}
