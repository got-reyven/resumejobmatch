"use client";

import {
  Search,
  CheckCircle2,
  ArrowRightLeft,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { ATSKeywordsData } from "@/services/insights/types";

export type ATSKeywordDisplayProps = ATSKeywordsData;

const likelihoodConfig = {
  high: {
    icon: ShieldCheck,
    label: "High",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
    barColor: "bg-green-500",
  },
  medium: {
    icon: ShieldAlert,
    label: "Medium",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    border: "border-yellow-200 dark:border-yellow-800",
    barColor: "bg-yellow-500",
  },
  low: {
    icon: ShieldX,
    label: "Low",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    barColor: "bg-red-500",
  },
};

const categoryLabels: Record<string, string> = {
  technical: "Technical",
  tool: "Tool",
  certification: "Cert",
  soft_skill: "Soft Skill",
  other: "Other",
};

export function ATSKeywordDisplay({
  keywords,
  ats_pass_likelihood,
  suggestion,
}: ATSKeywordDisplayProps) {
  const config = likelihoodConfig[ats_pass_likelihood];
  const LikelihoodIcon = config.icon;

  const found = keywords.filter((k) => k.found_in_resume);
  const missing = keywords.filter((k) => !k.found_in_resume);
  const coveragePercent =
    keywords.length > 0
      ? Math.round((found.length / keywords.length) * 100)
      : 0;

  return (
    <div className="flex flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Search className="h-5 w-5 text-orange-500" aria-hidden="true" />
        ATS Keyword Analysis
      </h3>

      <div
        className={cn(
          "mb-4 flex items-center gap-3 rounded-lg border p-3",
          config.bg,
          config.border
        )}
      >
        <LikelihoodIcon
          className={cn("h-8 w-8 shrink-0", config.color)}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold", config.color)}>
            ATS Pass Likelihood: {config.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {found.length} of {keywords.length} keywords found (
            {coveragePercent}
            %)
          </p>
        </div>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            config.barColor
          )}
          style={{ width: `${coveragePercent}%` }}
        />
      </div>

      {found.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-green-600">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Found Keywords
          </div>
          <div className="flex flex-wrap gap-1.5">
            {found.map((k) => (
              <Badge
                key={k.keyword}
                variant="outline"
                className="gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                title={k.resume_context ?? undefined}
              >
                {k.match_type === "semantic" && (
                  <ArrowRightLeft
                    className="h-3 w-3 opacity-60"
                    aria-hidden="true"
                  />
                )}
                {k.keyword}
                <span className="text-[10px] opacity-60">
                  {categoryLabels[k.category]}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-red-500">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Missing Keywords
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((k) => (
              <Badge
                key={k.keyword}
                variant="outline"
                className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
              >
                {k.keyword}
                <span className="ml-0.5 text-[10px] opacity-60">
                  {categoryLabels[k.category]}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto rounded-lg bg-muted/50 p-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Suggestion: </span>
          {suggestion}
        </p>
      </div>
    </div>
  );
}
