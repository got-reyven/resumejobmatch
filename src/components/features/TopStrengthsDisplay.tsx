"use client";

import { Trophy, Quote, ArrowRight } from "lucide-react";
import type { TopStrengthsData } from "@/services/insights/types";

export type TopStrengthsDisplayProps = TopStrengthsData;

export function TopStrengthsDisplay({ strengths }: TopStrengthsDisplayProps) {
  return (
    <div className="flex flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
        Top Strengths
      </h3>

      <div className="space-y-4">
        {strengths.map((strength, i) => (
          <div key={i} className="rounded-lg border bg-muted/30 p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm font-semibold">{strength.area}</span>
            </div>

            <div className="mb-2 flex items-start gap-2 rounded-md bg-background/60 p-2.5">
              <Quote
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-foreground/80">
                {strength.evidence}
              </p>
            </div>

            <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <ArrowRight
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{strength.relevance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
