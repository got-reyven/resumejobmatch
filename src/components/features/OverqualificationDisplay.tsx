"use client";

import { Scale, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface OverqualificationDisplayProps {
  is_overqualified: boolean;
  confidence: "high" | "moderate" | "low";
  indicators: string[];
  recommendation: string;
}

const CONFIDENCE_CONFIG = {
  high: {
    label: "High Confidence",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  moderate: {
    label: "Moderate Confidence",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  low: {
    label: "Low Confidence",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
} as const;

export function OverqualificationDisplay({
  is_overqualified,
  confidence,
  indicators,
  recommendation,
}: OverqualificationDisplayProps) {
  const confidenceConfig = CONFIDENCE_CONFIG[confidence];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-pink-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Overqualification Assessment</h3>
      </div>

      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-4",
          is_overqualified
            ? "border-amber-200 bg-amber-50/50"
            : "border-emerald-200 bg-emerald-50/50"
        )}
      >
        {is_overqualified ? (
          <AlertTriangle
            className="h-6 w-6 shrink-0 text-amber-500"
            aria-hidden="true"
          />
        ) : (
          <CheckCircle2
            className="h-6 w-6 shrink-0 text-emerald-500"
            aria-hidden="true"
          />
        )}
        <div>
          <p className="text-sm font-semibold">
            {is_overqualified
              ? "Candidate appears overqualified"
              : "No significant overqualification detected"}
          </p>
          <span
            className={cn(
              "mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              confidenceConfig.badgeClass
            )}
          >
            {confidenceConfig.label}
          </span>
        </div>
      </div>

      {indicators.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {is_overqualified
              ? "Overqualification Indicators"
              : "Assessment Notes"}
          </p>
          <ul className="space-y-1.5">
            {indicators.map((indicator, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2"
              >
                <span
                  className={cn(
                    "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                    is_overqualified ? "bg-amber-400" : "bg-emerald-400"
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {indicator}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg border bg-background p-4">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-pink-400"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-medium text-foreground">Recommendation</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
