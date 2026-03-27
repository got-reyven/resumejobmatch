"use client";

import { useState } from "react";
import Link from "next/link";
import { PenLine, ArrowRight, Copy, Check, Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface RewriteSuggestionsDisplayProps {
  rewrites: {
    original: string;
    suggested: string;
    rationale: string;
    section: string;
  }[];
  isPro?: boolean;
}

const FREE_LIMIT = 1;

export function RewriteSuggestionsDisplay({
  rewrites,
  isPro = false,
}: RewriteSuggestionsDisplayProps) {
  const visibleRewrites = isPro ? rewrites : rewrites.slice(0, FREE_LIMIT);
  const hiddenCount = rewrites.length - visibleRewrites.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PenLine className="h-5 w-5 text-rose-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Rewrite Suggestions</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        {rewrites.length} experience bullet{rewrites.length !== 1 ? "s" : ""}{" "}
        rewritten using the job&apos;s language and power verbs.
      </p>

      <div className="space-y-4">
        {visibleRewrites.map((rw, i) => (
          <RewriteCard key={i} rewrite={rw} index={i} />
        ))}
      </div>

      {!isPro && hiddenCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                +{hiddenCount} more rewrite{hiddenCount > 1 ? "s" : ""}{" "}
                available with Pro
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                Upgrade to see all bullet rewrites with before/after comparison
                and rationale.
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

function RewriteCard({
  rewrite,
  index,
}: {
  rewrite: RewriteSuggestionsDisplayProps["rewrites"][number];
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rewrite.suggested);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">
            {index + 1}
          </span>
          {rewrite.section}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Copy suggested bullet"
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
      </div>

      <div className="grid gap-0 sm:grid-cols-2">
        <div className="border-b p-4 sm:border-b-0 sm:border-r">
          <span className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Original
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {rewrite.original}
          </p>
        </div>
        <div className="p-4">
          <span className="mb-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-rose-500">
            <ArrowRight className="h-3 w-3" />
            Suggested
          </span>
          <p className={cn("text-sm leading-relaxed")}>{rewrite.suggested}</p>
        </div>
      </div>

      <div className="border-t bg-muted/20 px-4 py-2">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Why: </span>
          {rewrite.rationale}
        </p>
      </div>
    </div>
  );
}
