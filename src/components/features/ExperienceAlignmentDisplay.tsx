"use client";

import {
  Briefcase,
  CheckCircle2,
  ArrowRightLeft,
  MinusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { ExperienceAlignmentData } from "@/services/insights/types";

export type ExperienceAlignmentDisplayProps = ExperienceAlignmentData;

const seniorityConfig = {
  under: {
    label: "Under-leveled",
    color: "text-yellow-600",
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
  },
  match: {
    label: "Good fit",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/40",
  },
  over: {
    label: "Over-qualified",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
};

const industryConfig = {
  same: { label: "Same industry", color: "text-green-600" },
  adjacent: { label: "Adjacent industry", color: "text-yellow-600" },
  different: { label: "Different industry", color: "text-red-500" },
};

const relevanceConfig = {
  direct: { icon: CheckCircle2, color: "text-green-600", label: "Direct" },
  transferable: {
    icon: ArrowRightLeft,
    color: "text-yellow-600",
    label: "Transferable",
  },
  unrelated: {
    icon: MinusCircle,
    color: "text-muted-foreground",
    label: "Unrelated",
  },
};

export function ExperienceAlignmentDisplay({
  total_relevant_years,
  required_years,
  seniority_fit,
  industry_alignment,
  role_mapping,
  summary,
}: ExperienceAlignmentDisplayProps) {
  const seniority = seniorityConfig[seniority_fit];
  const industry = industryConfig[industry_alignment];

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Briefcase className="h-5 w-5 text-indigo-500" aria-hidden="true" />
        Experience Alignment
      </h3>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold">{total_relevant_years}</p>
          <p className="text-xs text-muted-foreground">
            Relevant {total_relevant_years === 1 ? "year" : "years"}
            {required_years !== null && (
              <span> / {required_years} required</span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-lg bg-muted/50 p-3">
          <Badge className={cn("text-xs", seniority.bg, seniority.color)}>
            {seniority.label}
          </Badge>
          <span className={cn("text-xs font-medium", industry.color)}>
            {industry.label}
          </span>
        </div>
      </div>

      <div className="mb-3 flex-1 space-y-2">
        {role_mapping.map((role) => {
          const config = relevanceConfig[role.relevance];
          const Icon = config.icon;
          return (
            <div key={role.resume_role} className="rounded-lg border p-2.5">
              <div className="flex items-center gap-2">
                <Icon
                  className={cn("h-4 w-4 shrink-0", config.color)}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium leading-tight">
                  {role.resume_role}
                </span>
                <span
                  className={cn(
                    "ml-auto shrink-0 text-[10px] font-medium",
                    config.color
                  )}
                >
                  {config.label}
                </span>
              </div>
              {role.relevant_aspects.length > 0 && (
                <ul className="mt-1.5 space-y-0.5 pl-6">
                  {role.relevant_aspects.map((aspect) => (
                    <li
                      key={aspect}
                      className="text-xs leading-relaxed text-muted-foreground"
                    >
                      {aspect}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto rounded-lg bg-muted/50 p-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {summary}
        </p>
      </div>
    </div>
  );
}
