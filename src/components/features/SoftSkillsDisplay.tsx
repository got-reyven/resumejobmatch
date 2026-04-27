"use client";

import Link from "next/link";
import { Heart, Lock, Crown, Check, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const STRENGTH_CONFIG = {
  strong: {
    label: "Strong",
    icon: Check,
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClass: "text-emerald-500",
    barClass: "bg-emerald-500",
  },
  moderate: {
    label: "Moderate",
    icon: Minus,
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    iconClass: "text-amber-500",
    barClass: "bg-amber-400",
  },
  weak: {
    label: "Weak",
    icon: Minus,
    badgeClass: "border-orange-200 bg-orange-50 text-orange-700",
    iconClass: "text-orange-400",
    barClass: "bg-orange-400",
  },
  none: {
    label: "Not Found",
    icon: X,
    badgeClass: "border-red-200 bg-red-50 text-red-600",
    iconClass: "text-red-400",
    barClass: "bg-red-400",
  },
} as const;

export interface SoftSkillsDisplayProps {
  skills: {
    skill: string;
    required: boolean;
    evidence_strength: "strong" | "moderate" | "weak" | "none";
    evidence: string | null;
    suggestion: string | null;
  }[];
  coverage_percent: number;
  summary: string;
  isPro?: boolean;
}

export function SoftSkillsDisplay({
  skills,
  coverage_percent,
  summary,
  isPro = false,
}: SoftSkillsDisplayProps) {
  const strongCount = skills.filter(
    (s) => s.evidence_strength === "strong"
  ).length;
  const moderateCount = skills.filter(
    (s) => s.evidence_strength === "moderate"
  ).length;
  const weakCount = skills.filter((s) => s.evidence_strength === "weak").length;
  const noneCount = skills.filter((s) => s.evidence_strength === "none").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-pink-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Soft Skills Alignment</h3>
      </div>

      {/* Coverage banner */}
      <div className="flex items-center gap-3 rounded-lg border border-pink-200 bg-pink-50/50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-100">
          <span className="text-lg font-bold text-pink-700">
            {coverage_percent}%
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Soft Skills Coverage
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {strongCount + moderateCount} of {skills.length} skills demonstrated
          </p>
        </div>
      </div>

      {/* Strength distribution */}
      <div className="flex flex-wrap gap-2">
        {strongCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {strongCount} Strong
          </span>
        )}
        {moderateCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {moderateCount} Moderate
          </span>
        )}
        {weakCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            {weakCount} Weak
          </span>
        )}
        {noneCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            {noneCount} Not Found
          </span>
        )}
      </div>

      {/* Skills list */}
      <div className="space-y-2">
        {skills.map((s, i) => {
          const cfg = STRENGTH_CONFIG[s.evidence_strength];
          const Icon = cfg.icon;
          return (
            <div key={i} className="rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn("h-3.5 w-3.5", cfg.iconClass)}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{s.skill}</span>
                  {s.required && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                      Required
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    cfg.badgeClass
                  )}
                >
                  {cfg.label}
                </span>
              </div>

              {isPro && s.evidence && (
                <p className="mt-2 pl-5.5 text-xs leading-relaxed text-muted-foreground">
                  {s.evidence}
                </p>
              )}

              {isPro && s.suggestion && (
                <p className="mt-1.5 pl-5.5 text-xs leading-relaxed text-emerald-700">
                  💡 {s.suggestion}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Pro gate CTA */}
      {!isPro && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Upgrade to Pro for detailed evidence & suggestions
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                See exactly where your resume demonstrates each soft skill and
                get actionable tips to strengthen weak areas.
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

      {/* Summary */}
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  );
}
