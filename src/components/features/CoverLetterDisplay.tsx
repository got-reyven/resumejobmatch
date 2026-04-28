"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Crown, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CoverLetterDisplayProps {
  opening_paragraph: string;
  body_paragraphs: string[];
  closing_paragraph: string;
  key_points_used: string[];
  tone: string;
  isPro?: boolean;
}

export function CoverLetterDisplay({
  opening_paragraph,
  body_paragraphs,
  closing_paragraph,
  key_points_used,
  tone,
  isPro = false,
}: CoverLetterDisplayProps) {
  const [copied, setCopied] = useState(false);

  const visibleText = isPro
    ? [opening_paragraph, ...body_paragraphs, closing_paragraph].join("\n\n")
    : opening_paragraph;

  function handleCopy() {
    navigator.clipboard.writeText(visibleText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-blue-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Cover Letter Starter</h3>
      </div>

      {/* Tone badge + Copy button */}
      <div className="flex items-center justify-between">
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Tone: {tone}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5 text-xs cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Letter content */}
      <div className="rounded-lg border bg-background p-4 space-y-4">
        {/* Opening paragraph — always visible */}
        <p className="text-sm leading-relaxed text-foreground">
          {opening_paragraph}
        </p>

        {isPro ? (
          <>
            {body_paragraphs.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground">
                {p}
              </p>
            ))}
            <p className="text-sm leading-relaxed text-foreground">
              {closing_paragraph}
            </p>
          </>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
            <p className="text-sm leading-relaxed text-foreground/40">
              {body_paragraphs[0]?.slice(0, 120)}...
            </p>
          </div>
        )}
      </div>

      {/* Pro gate CTA */}
      {!isPro && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Upgrade to Pro for the full cover letter
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                Get the complete cover letter with body paragraphs and a
                professional closing — ready to copy, paste, and send.
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

      {/* Key points */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5">
          Key alignment points used
        </p>
        <div className="flex flex-wrap gap-1.5">
          {key_points_used.map((point, i) => (
            <span
              key={i}
              className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {point}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
