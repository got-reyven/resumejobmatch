"use client";

import Link from "next/link";
import { MessageCircleQuestion, Ear, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface InterviewFocusDisplayProps {
  questions: {
    question: string;
    rationale: string;
    category: "technical" | "experience" | "culture" | "growth";
    listen_for: string;
  }[];
  isPro?: boolean;
}

const CATEGORY_CONFIG = {
  technical: {
    label: "Technical",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    barClass: "bg-blue-500",
  },
  experience: {
    label: "Experience",
    badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
    barClass: "bg-indigo-500",
  },
  culture: {
    label: "Culture",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    barClass: "bg-emerald-500",
  },
  growth: {
    label: "Growth",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    barClass: "bg-amber-500",
  },
} as const;

const FREE_LIMIT = 3;
const PRO_LIMIT = 10;

export function InterviewFocusDisplay({
  questions,
  isPro = false,
}: InterviewFocusDisplayProps) {
  const cappedQuestions = questions.slice(0, PRO_LIMIT);
  const visibleQuestions = isPro
    ? cappedQuestions
    : cappedQuestions.slice(0, FREE_LIMIT);
  const hiddenCount = cappedQuestions.length - visibleQuestions.length;

  const categoryCounts = cappedQuestions.reduce(
    (acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircleQuestion
          className="h-5 w-5 text-violet-500"
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold">Interview Focus Points</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        {cappedQuestions.length} targeted question
        {cappedQuestions.length !== 1 ? "s" : ""} based on gaps and ambiguous
        areas identified in the match analysis.
      </p>

      <div className="flex flex-wrap gap-3">
        {(
          Object.entries(categoryCounts) as [
            keyof typeof CATEGORY_CONFIG,
            number,
          ][]
        ).map(([cat, count]) => {
          const config = CATEGORY_CONFIG[cat];
          return (
            <span
              key={cat}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                config.badgeClass
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", config.barClass)} />
              {count} {config.label}
            </span>
          );
        })}
      </div>

      <div className="space-y-3">
        {visibleQuestions.map((q, i) => {
          const config = CATEGORY_CONFIG[q.category];

          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border bg-background p-4"
            >
              <div
                className={cn(
                  "absolute left-0 top-0 h-full w-1",
                  config.barClass
                )}
              />

              <div className="ml-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold leading-snug">
                      {q.question}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                      config.badgeClass
                    )}
                  >
                    {config.label}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {q.rationale}
                </p>

                <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2">
                  <Ear
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Listen for:{" "}
                    </span>
                    {q.listen_for}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isPro && hiddenCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                +{hiddenCount} more question{hiddenCount > 1 ? "s" : ""}{" "}
                available
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                Upgrade to Pro to see all interview questions with detailed
                rationale.
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
    </div>
  );
}
