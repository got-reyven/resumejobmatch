"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Crown,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { TailoredSummaryData } from "@/services/insights/types";

export interface TailoredSummaryDisplayProps extends TailoredSummaryData {
  isPro?: boolean;
}

function getFirstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return match ? match[0] : text;
}

export function TailoredSummaryDisplay({
  current_summary,
  suggested_summary,
  key_changes,
  isPro = false,
}: TailoredSummaryDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  const firstSentence = getFirstSentence(suggested_summary);
  const hasMore = suggested_summary.length > firstSentence.length;
  const showFull = isPro || !hasMore;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(suggested_summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="flex flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <FileText className="h-5 w-5 text-teal-500" aria-hidden="true" />
        Tailored Summary Suggestion
      </h3>

      {current_summary && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowCurrent((prev) => !prev)}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {showCurrent ? "Hide" : "Show"} current summary
          </button>
          {showCurrent && (
            <div className="mt-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-3">
              <p className="text-xs italic leading-relaxed text-muted-foreground">
                {current_summary}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-4 dark:border-teal-800 dark:bg-teal-950/30">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-600">
            <ArrowRight className="h-3 w-3" />
            Suggested Summary
          </span>
          {showFull && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-teal-600 transition-colors hover:bg-teal-100 dark:hover:bg-teal-900"
              aria-label="Copy suggested summary"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>

        {showFull ? (
          <p className="text-sm leading-relaxed">{suggested_summary}</p>
        ) : (
          <div>
            <p className="text-sm leading-relaxed">
              {firstSentence}
              <span className="select-none text-muted-foreground/40">
                {" "}
                {suggested_summary
                  .slice(firstSentence.length)
                  .split("")
                  .map(() => "█")
                  .join("")
                  .slice(0, 60)}
                ...
              </span>
            </p>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                    Upgrade to Pro to see the full summary
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-700/80 dark:text-amber-300/70">
                    Get the complete AI-tailored professional summary ready to
                    copy into your resume.
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
          </div>
        )}
      </div>

      {key_changes.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Key Changes
          </p>
          <ul className="space-y-1.5">
            {key_changes.map((change) => (
              <li
                key={change}
                className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
              >
                <CheckCircle2
                  className={cn(
                    "mt-0.5 h-3.5 w-3.5 shrink-0",
                    showFull ? "text-teal-500" : "text-muted-foreground/40"
                  )}
                  aria-hidden="true"
                />
                <span className={showFull ? "" : "blur-[2px] select-none"}>
                  {change}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
