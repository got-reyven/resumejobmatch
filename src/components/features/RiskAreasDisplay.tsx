"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface RiskAreasDisplayProps {
  risks: {
    area: string;
    severity: "critical" | "moderate" | "minor";
    detail: string;
    mitigation: string | null;
  }[];
  summary: string;
  isPro?: boolean;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: ShieldAlert,
    label: "Critical",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    barClass: "bg-red-500",
    iconClass: "text-red-500",
  },
  moderate: {
    icon: Shield,
    label: "Moderate",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    barClass: "bg-amber-500",
    iconClass: "text-amber-500",
  },
  minor: {
    icon: ShieldCheck,
    label: "Minor",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
    barClass: "bg-blue-400",
    iconClass: "text-blue-400",
  },
} as const;

const FREE_LIMIT = 3;

export function RiskAreasDisplay({
  risks,
  summary,
  isPro = false,
}: RiskAreasDisplayProps) {
  const visibleRisks = isPro ? risks : risks.slice(0, FREE_LIMIT);
  const hiddenCount = risks.length - visibleRisks.length;

  const criticalCount = risks.filter((r) => r.severity === "critical").length;
  const moderateCount = risks.filter((r) => r.severity === "moderate").length;
  const minorCount = risks.filter((r) => r.severity === "minor").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Risk Areas &amp; Gaps</h3>
      </div>

      <p className="text-sm text-muted-foreground">{summary}</p>

      <div className="flex flex-wrap gap-3">
        {criticalCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {criticalCount} Critical
          </span>
        )}
        {moderateCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {moderateCount} Moderate
          </span>
        )}
        {minorCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            {minorCount} Minor
          </span>
        )}
      </div>

      <div className="space-y-3">
        {visibleRisks.map((risk, i) => {
          const config = SEVERITY_CONFIG[risk.severity];
          const Icon = config.icon;

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
                  <div className="flex items-center gap-2">
                    <Icon
                      className={cn("h-4 w-4 shrink-0", config.iconClass)}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold">{risk.area}</span>
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
                  {risk.detail}
                </p>

                {risk.mitigation && (
                  <div className="rounded-md bg-muted/50 px-3 py-2">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Mitigation:{" "}
                      </span>
                      {risk.mitigation}
                    </p>
                  </div>
                )}
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
                +{hiddenCount} more risk{hiddenCount > 1 ? "s" : ""} identified
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80">
                Upgrade to Pro to see the complete risk assessment with all
                mitigation strategies.
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
