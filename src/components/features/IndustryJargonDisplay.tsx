"use client";

import Link from "next/link";
import { BookOpen, Check, X, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface IndustryJargonDisplayProps {
  industry: string;
  terms: {
    term: string;
    present: boolean;
    suggestion: string | null;
  }[];
  summary: string;
  isPro?: boolean;
}

const FREE_LIMIT = 1;

export function IndustryJargonDisplay({
  industry,
  terms,
  summary,
  isPro = false,
}: IndustryJargonDisplayProps) {
  const presentCount = terms.filter((t) => t.present).length;
  const missingTerms = terms.filter((t) => !t.present);
  const visibleMissing = isPro
    ? missingTerms
    : missingTerms.slice(0, FREE_LIMIT);
  const hiddenCount = isPro ? 0 : Math.max(0, missingTerms.length - FREE_LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-sky-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Industry Jargon Check</h3>
      </div>

      {/* Industry badge + coverage */}
      <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50/50 p-4">
        <BookOpen
          className="h-6 w-6 shrink-0 text-sky-500"
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold text-foreground">{industry}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {presentCount} of {terms.length} key terms found in your resume
          </p>
        </div>
      </div>

      {/* Terms present */}
      {terms.filter((t) => t.present).length > 0 && (
        <div className="rounded-lg border bg-background p-3">
          <p className="mb-2 text-sm font-medium">Terms Found</p>
          <div className="flex flex-wrap gap-1.5">
            {terms
              .filter((t) => t.present)
              .map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                >
                  <Check className="h-3 w-3" />
                  {t.term}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Missing terms with suggestions */}
      {missingTerms.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Missing Terms & Suggestions</p>

          {visibleMissing.map((t, i) => (
            <div key={i} className="rounded-lg border bg-background p-3">
              <div className="flex items-center gap-2">
                <X className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
                <span className="text-sm font-medium text-foreground">
                  {t.term}
                </span>
              </div>
              {t.suggestion && (
                <p className="mt-1.5 pl-5.5 text-sm leading-relaxed text-muted-foreground">
                  {t.suggestion}
                </p>
              )}
            </div>
          ))}

          {/* Pro gate for remaining suggestions */}
          {hiddenCount > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">
                    +{hiddenCount} more suggestion{hiddenCount > 1 ? "s" : ""}{" "}
                    available
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700/80">
                    Upgrade to Pro to see all missing terms with actionable
                    suggestions to strengthen your resume.
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
      )}

      {/* Summary */}
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  );
}
