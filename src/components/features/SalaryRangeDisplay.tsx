"use client";

import Link from "next/link";
import { DollarSign, Lock, Crown, Info, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const CONFIDENCE_CONFIG = {
  high: {
    label: "High Confidence",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  moderate: {
    label: "Moderate Confidence",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    dotClass: "bg-amber-400",
  },
  low: {
    label: "Low Confidence",
    badgeClass: "border-red-200 bg-red-50 text-red-600",
    dotClass: "bg-red-400",
  },
} as const;

function formatSalary(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export interface SalaryRangeDisplayProps {
  range: {
    low: number;
    mid: number;
    high: number;
    currency: string;
  };
  confidence: "high" | "moderate" | "low";
  factors: string[];
  disclaimer: string;
  isPro?: boolean;
}

export function SalaryRangeDisplay({
  range,
  confidence,
  factors,
  disclaimer,
  isPro = false,
}: SalaryRangeDisplayProps) {
  const cfg = CONFIDENCE_CONFIG[confidence];
  const spread = range.high - range.low;
  const midPercent = spread > 0 ? ((range.mid - range.low) / spread) * 100 : 50;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-green-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Salary Range Indicator</h3>
      </div>

      {/* Range banner */}
      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Estimated Annual Range
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              cfg.badgeClass
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dotClass)} />
            {cfg.label}
          </span>
        </div>

        {/* Salary bar visualization */}
        <div className="mt-4">
          <div className="flex items-end justify-between text-xs text-muted-foreground">
            <span>{formatSalary(range.low, range.currency)}</span>
            <span className="text-base font-bold text-foreground">
              {formatSalary(range.mid, range.currency)}
            </span>
            <span>{formatSalary(range.high, range.currency)}</span>
          </div>
          <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-green-100">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-300 via-green-500 to-green-300" />
            <div
              className="absolute top-0 h-full w-1 -translate-x-1/2 rounded-full bg-green-800"
              style={{ left: `${midPercent}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Low</span>
            <span>Mid</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Factors — Pro only */}
      {isPro && factors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-foreground">
              Contributing Factors
            </p>
          </div>
          <ul className="space-y-1.5 pl-1">
            {factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pro gate CTA */}
      {!isPro && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Upgrade to Business Pro for contributing factors
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                See the {factors.length} factors that influenced this estimate —
                experience level, skill demand, seniority signals, and more.
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

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <Info
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
          aria-hidden="true"
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground italic">
          {disclaimer}
        </p>
      </div>
    </div>
  );
}
