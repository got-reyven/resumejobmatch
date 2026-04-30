"use client";

import Link from "next/link";
import { GitBranch, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const LEVEL_CONFIG = {
  high: {
    label: "High",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  moderate: {
    label: "Moderate",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-400",
  },
  low: {
    label: "Low",
    badgeClass: "border-red-200 bg-red-50 text-red-600",
    dotClass: "bg-red-400",
  },
} as const;

export interface SkillTransferabilityDisplayProps {
  transfers: {
    required_skill: string;
    candidate_skill: string;
    transferability: "high" | "moderate" | "low";
    rationale: string;
  }[];
  summary: string;
  isPro?: boolean;
}

export function SkillTransferabilityDisplay({
  transfers,
  summary,
  isPro = false,
}: SkillTransferabilityDisplayProps) {
  const highCount = transfers.filter(
    (t) => t.transferability === "high"
  ).length;
  const modCount = transfers.filter(
    (t) => t.transferability === "moderate"
  ).length;
  const lowCount = transfers.filter((t) => t.transferability === "low").length;

  const teaserTransfers = transfers.slice(0, 2);
  const visibleTransfers = isPro ? transfers : teaserTransfers;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5 text-purple-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Skill Transferability Map</h3>
      </div>

      {transfers.length === 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-sm font-medium text-emerald-700">
            Full coverage — no transferability mapping needed.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
      ) : (
        <>
          {/* Stats banner */}
          <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50/50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <span className="text-lg font-bold text-purple-700">
                {transfers.length}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Transferable Skill{transfers.length !== 1 ? "s" : ""} Identified
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Adjacent skills that could bridge requirement gaps
              </p>
            </div>
          </div>

          {/* Distribution badges */}
          <div className="flex flex-wrap gap-2">
            {highCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {highCount} High
              </span>
            )}
            {modCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {modCount} Moderate
              </span>
            )}
            {lowCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {lowCount} Low
              </span>
            )}
          </div>

          {/* Transfer table */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-medium text-muted-foreground">
                  <th className="w-[100px] px-3 py-2 text-left">Level</th>
                  <th className="px-3 py-2 text-left">Current Skill</th>
                  <th className="px-3 py-2 text-left">Required Skill</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransfers.map((t, i) => {
                  const cfg = LEVEL_CONFIG[t.transferability];
                  return (
                    <tr
                      key={i}
                      className={cn(
                        "border-b last:border-b-0",
                        isPro && t.rationale ? "" : ""
                      )}
                    >
                      <td className="px-3 py-2.5 align-top">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            cfg.badgeClass
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              cfg.dotClass
                            )}
                          />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 align-top font-medium text-muted-foreground">
                        {t.candidate_skill}
                        {isPro && t.rationale && (
                          <p className="mt-1 font-normal text-xs leading-relaxed text-muted-foreground/70">
                            {t.rationale}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2.5 align-top font-medium">
                        {t.required_skill}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pro gate CTA */}
          {!isPro && transfers.length > 2 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">
                    Upgrade to Business Pro for full transferability analysis
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700/80">
                    See all {transfers.length} skill transfers with detailed
                    rationale explaining what concepts and patterns carry over.
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

          {!isPro && transfers.length <= 2 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">
                    Upgrade to Business Pro for detailed rationale
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700/80">
                    See why each candidate skill is transferable — what shared
                    concepts, tools, and patterns make the transition feasible.
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
          <p className="text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </>
      )}
    </div>
  );
}
