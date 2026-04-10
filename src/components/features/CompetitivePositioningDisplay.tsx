"use client";

import Link from "next/link";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  Crown,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface CompetitivePositioningDisplayProps {
  positioning: string;
  confidence: "high" | "moderate" | "low";
  strong_areas: string[];
  weak_areas: string[];
  recommendation: string;
  isPro?: boolean;
}

const CONFIDENCE_CONFIG = {
  high: {
    label: "High Confidence",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  moderate: {
    label: "Moderate Confidence",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  low: {
    label: "Low Confidence",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
} as const;

export function CompetitivePositioningDisplay({
  positioning,
  confidence,
  strong_areas,
  weak_areas,
  recommendation,
  isPro = false,
}: CompetitivePositioningDisplayProps) {
  const conf = CONFIDENCE_CONFIG[confidence];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-green-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Competitive Positioning</h3>
      </div>

      {/* Positioning estimate + confidence — always visible */}
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 p-4">
        <TrendingUp
          className="h-6 w-6 shrink-0 text-green-500"
          aria-hidden="true"
        />
        <div>
          <p className="text-base font-semibold text-foreground">
            {positioning}
          </p>
          <span
            className={cn(
              "mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              conf.className
            )}
          >
            {conf.label}
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Strong areas — always visible */}
        <div className="rounded-lg border bg-background p-3">
          <div className="mb-2 flex items-center gap-1.5">
            <CheckCircle2
              className="h-4 w-4 text-emerald-500"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">Strong Areas</p>
          </div>
          <ul className="space-y-1.5">
            {strong_areas.map((area, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {area}
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps to Address — Pro only */}
        {isPro ? (
          <div className="rounded-lg border bg-background p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <AlertTriangle
                className="h-4 w-4 text-amber-500"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">Gaps to Address</p>
            </div>
            <ul className="space-y-1.5">
              {weak_areas.map((area, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="relative rounded-lg border bg-background p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <AlertTriangle
                className="h-4 w-4 text-amber-500"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">Gaps to Address</p>
            </div>
            <div className="space-y-1.5">
              {weak_areas.slice(0, 1).map((area, i) => (
                <p
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground blur-[5px] select-none"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {area}
                </p>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-[1px]">
              <Lock className="mb-1 h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Pro only
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendation — Pro only */}
      {isPro ? (
        <div className="flex items-start gap-2 rounded-lg border bg-background p-4">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-sky-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-xs font-medium text-foreground">
              Recommendation
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {recommendation}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg border bg-background p-4">
          <div className="flex items-start gap-2 blur-[5px] select-none">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
            <div>
              <p className="text-xs font-medium text-foreground">
                Recommendation
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {recommendation}
              </p>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-[1px]">
            <Crown className="mb-1.5 h-5 w-5 text-amber-500" />
            <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
              Upgrade to Pro to see gaps and recommendations
            </p>
            <Button
              asChild
              size="sm"
              className="gap-1.5 bg-amber-600 text-xs hover:bg-amber-700"
            >
              <Link href="/pricing">
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60">
        This is a directional estimate based on requirement coverage analysis,
        not actual applicant pool data.
      </p>
    </div>
  );
}
