"use client";

import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ResumeIntegrityDisplayProps {
  risk_level: "none" | "low" | "medium" | "high";
  is_clean: boolean;
  findings: {
    type: string;
    description: string;
    excerpt: string;
    severity: "warning" | "critical";
  }[];
  summary: string;
  recommendation: string;
}

const RISK_CONFIG = {
  none: {
    label: "No Risk Detected",
    icon: ShieldCheck,
    bannerClass: "border-emerald-200 bg-emerald-50/50",
    iconClass: "text-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  low: {
    label: "Low Risk",
    icon: ShieldCheck,
    bannerClass: "border-blue-200 bg-blue-50/50",
    iconClass: "text-blue-500",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  medium: {
    label: "Medium Risk",
    icon: ShieldAlert,
    bannerClass: "border-amber-200 bg-amber-50/50",
    iconClass: "text-amber-500",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  high: {
    label: "High Risk",
    icon: ShieldAlert,
    bannerClass: "border-red-200 bg-red-50/50",
    iconClass: "text-red-500",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
} as const;

const TYPE_LABELS: Record<string, string> = {
  score_inflation: "Score Inflation",
  instruction_override: "Instruction Override",
  ranking_manipulation: "Ranking Manipulation",
  system_prompt_leak: "System Prompt Leak",
  role_hijack: "Role Hijack",
  suspicious_content: "Suspicious Content",
};

export function ResumeIntegrityDisplay({
  risk_level,
  findings,
  summary,
  recommendation,
}: ResumeIntegrityDisplayProps) {
  const config = RISK_CONFIG[risk_level];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-sky-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Resume Integrity Check</h3>
      </div>

      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-4",
          config.bannerClass
        )}
      >
        <Icon
          className={cn("h-6 w-6 shrink-0", config.iconClass)}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-semibold">{summary}</p>
          <span
            className={cn(
              "mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              config.badgeClass
            )}
          >
            {config.label}
          </span>
        </div>
      </div>

      {findings.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Detected Findings</p>
          <div className="space-y-2">
            {findings.map((finding, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-lg border bg-background p-3"
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full w-1",
                    finding.severity === "critical"
                      ? "bg-red-500"
                      : "bg-amber-400"
                  )}
                />
                <div className="ml-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {finding.severity === "critical" ? (
                      <AlertTriangle
                        className="h-3.5 w-3.5 text-red-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertTriangle
                        className="h-3.5 w-3.5 text-amber-500"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                        finding.severity === "critical"
                          ? "border-red-200 bg-red-100 text-red-700"
                          : "border-amber-200 bg-amber-100 text-amber-700"
                      )}
                    >
                      {TYPE_LABELS[finding.type] ?? finding.type}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium uppercase",
                        finding.severity === "critical"
                          ? "text-red-600"
                          : "text-amber-600"
                      )}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {finding.description}
                  </p>
                  {finding.excerpt && (
                    <div className="rounded bg-muted/50 px-2.5 py-1.5">
                      <p className="font-mono text-xs text-muted-foreground">
                        &quot;{finding.excerpt}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {findings.length === 0 && risk_level === "none" && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/30 p-3">
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
            aria-hidden="true"
          />
          <p className="text-sm text-emerald-700">
            No prompt injection or manipulation attempts were detected in this
            resume. The content appears legitimate.
          </p>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg border bg-background p-4">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-sky-400"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-medium text-foreground">Recommendation</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
