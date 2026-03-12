"use client";

import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { QualificationFitData } from "@/services/insights/types";

export type QualificationFitDisplayProps = QualificationFitData;

const statusConfig = {
  met: {
    icon: CheckCircle2,
    label: "Met",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
  },
  partially_met: {
    icon: AlertCircle,
    label: "Partial",
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  not_found: {
    icon: XCircle,
    label: "Not found",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
  },
};

export function QualificationFitDisplay({
  qualifications,
  summary,
}: QualificationFitDisplayProps) {
  const metCount = qualifications.filter((q) => q.status === "met").length;
  const partialCount = qualifications.filter(
    (q) => q.status === "partially_met"
  ).length;
  const missingCount = qualifications.filter(
    (q) => q.status === "not_found"
  ).length;
  const total = qualifications.length;

  return (
    <div className="flex flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <GraduationCap className="h-5 w-5 text-purple-500" aria-hidden="true" />
        Qualification Fit
      </h3>

      {total === 0 ? (
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-3">
            <div className="flex-1 rounded-lg bg-green-50 p-2.5 text-center dark:bg-green-950">
              <p className="text-xl font-bold text-green-600">{metCount}</p>
              <p className="text-[10px] font-medium text-green-600/70">Met</p>
            </div>
            <div className="flex-1 rounded-lg bg-yellow-50 p-2.5 text-center dark:bg-yellow-950">
              <p className="text-xl font-bold text-yellow-600">
                {partialCount}
              </p>
              <p className="text-[10px] font-medium text-yellow-600/70">
                Partial
              </p>
            </div>
            <div className="flex-1 rounded-lg bg-red-50 p-2.5 text-center dark:bg-red-950">
              <p className="text-xl font-bold text-red-500">{missingCount}</p>
              <p className="text-[10px] font-medium text-red-500/70">
                Not found
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {qualifications.map((q) => {
              const config = statusConfig[q.status];
              const Icon = config.icon;
              return (
                <div
                  key={q.requirement}
                  className={cn("rounded-lg border p-3", config.border)}
                >
                  <div className="flex items-start gap-2">
                    <Icon
                      className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium leading-tight">
                          {q.requirement}
                        </span>
                        {q.type === "preferred" && (
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            preferred
                          </span>
                        )}
                      </div>
                      {q.evidence && (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {q.evidence}
                        </p>
                      )}
                      {q.note && (
                        <p
                          className={cn(
                            "mt-1 text-xs leading-relaxed",
                            q.status === "not_found"
                              ? "text-red-500/80"
                              : "text-yellow-600/80"
                          )}
                        >
                          {q.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 rounded-lg bg-muted/50 p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {summary}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
