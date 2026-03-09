"use client";

import { CheckCircle2, XCircle, ArrowRightLeft, Puzzle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { SkillsBreakdownData } from "@/services/insights/types";

export type SkillsBreakdownDisplayProps = SkillsBreakdownData;

function getCoverageColor(percent: number): string {
  if (percent >= 80) return "text-green-600";
  if (percent >= 60) return "text-yellow-600";
  if (percent >= 40) return "text-orange-500";
  return "text-red-500";
}

function getCoverageBarColor(percent: number): string {
  if (percent >= 80) return "bg-green-500";
  if (percent >= 60) return "bg-yellow-500";
  if (percent >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function SkillsBreakdownDisplay({
  matched,
  missing,
  coverage_percent,
}: SkillsBreakdownDisplayProps) {
  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Puzzle className="h-5 w-5 text-blue-500" aria-hidden="true" />
        Skills Match Breakdown
      </h3>

      <div className="mb-4 space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Skills Coverage</span>
          <span
            className={cn("font-semibold", getCoverageColor(coverage_percent))}
          >
            {coverage_percent}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              getCoverageBarColor(coverage_percent)
            )}
            style={{ width: `${coverage_percent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {matched.length} of {matched.length + missing.length} skills found
        </p>
      </div>

      {matched.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-green-600">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Matched Skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((m) => (
              <Badge
                key={m.skill}
                variant="outline"
                className="gap-1 border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              >
                {m.type === "semantic" && (
                  <ArrowRightLeft
                    className="h-3 w-3 opacity-60"
                    aria-hidden="true"
                  />
                )}
                {m.type === "semantic" && m.resume_term
                  ? `${m.resume_term} ≈ ${m.skill}`
                  : m.skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-red-500">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Missing Skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((m) => (
              <Badge
                key={m.skill}
                variant="outline"
                className={cn(
                  "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
                  m.priority === "preferred" && "opacity-70"
                )}
              >
                {m.skill}
                {m.priority === "preferred" && (
                  <span className="ml-0.5 text-[10px] opacity-60">
                    preferred
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
