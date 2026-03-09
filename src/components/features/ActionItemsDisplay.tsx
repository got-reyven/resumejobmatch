"use client";

import { ArrowUp, Minus, FileText, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { ActionItemsData } from "@/services/insights/types";

export type ActionItemsDisplayProps = ActionItemsData;

const sectionLabels: Record<string, string> = {
  skills: "Skills",
  experience: "Experience",
  summary: "Summary",
  education: "Education",
  certifications: "Certifications",
};

export function ActionItemsDisplay({ actions }: ActionItemsDisplayProps) {
  const sorted = [...actions].sort((a, b) => a.priority - b.priority);

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Lightbulb className="h-5 w-5 text-yellow-500" aria-hidden="true" />
        Top 3 Action Items
      </h3>

      <div className="space-y-4">
        {sorted.map((action) => (
          <div
            key={action.priority}
            className="rounded-lg border bg-muted/30 p-3.5"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    action.priority === 1
                      ? "bg-primary"
                      : action.priority === 2
                        ? "bg-primary/70"
                        : "bg-primary/50"
                  )}
                >
                  {action.priority}
                </span>
                <span className="text-sm font-semibold leading-tight">
                  {action.title}
                </span>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 gap-1 text-[10px]",
                  action.impact === "high"
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                    : "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                )}
              >
                {action.impact === "high" ? (
                  <ArrowUp className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Minus className="h-3 w-3" aria-hidden="true" />
                )}
                {action.impact}
              </Badge>
            </div>

            <ul className="mb-2 space-y-1 pl-8">
              {action.bullets.map((bullet, i) => (
                <li
                  key={i}
                  className="list-disc text-sm leading-relaxed text-muted-foreground"
                >
                  {bullet}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 pl-8 text-xs text-muted-foreground/70">
              <FileText className="h-3 w-3" aria-hidden="true" />
              Edit: {sectionLabels[action.section] ?? action.section}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
