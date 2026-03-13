"use client";

import {
  BarChart3,
  FileText,
  Code,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SectionStrengthData } from "@/services/insights/types";

export type SectionStrengthDisplayProps = SectionStrengthData;

const sectionIcons: Record<string, typeof FileText> = {
  summary: FileText,
  skills: Code,
  experience: Briefcase,
  education: GraduationCap,
  certifications: Award,
  other: Layers,
};

const sectionLabels: Record<string, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
  other: "Other",
};

function scoreColor(score: number) {
  if (score >= 4) return { bar: "bg-green-500", text: "text-green-600" };
  if (score === 3) return { bar: "bg-yellow-500", text: "text-yellow-600" };
  return { bar: "bg-red-500", text: "text-red-500" };
}

function scoreLabel(score: number) {
  if (score === 5) return "Excellent";
  if (score === 4) return "Good";
  if (score === 3) return "Adequate";
  if (score === 2) return "Weak";
  return "Very Weak";
}

export function SectionStrengthDisplay({
  sections,
  weakest,
  summary,
}: SectionStrengthDisplayProps) {
  const avgScore =
    sections.length > 0
      ? sections.reduce((sum, s) => sum + s.score, 0) / sections.length
      : 0;

  return (
    <div className="flex flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <BarChart3 className="h-5 w-5 text-indigo-500" aria-hidden="true" />
        Resume Section Strength
      </h3>

      <div className="mb-4 flex items-center gap-3 rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">
            {avgScore.toFixed(1)}
          </p>
          <p className="text-[10px] font-medium text-indigo-500/70">
            avg / 5.0
          </p>
        </div>
        <div className="min-w-0 flex-1 border-l border-indigo-200 pl-3 dark:border-indigo-800">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = sectionIcons[section.name] ?? Layers;
          const label = sectionLabels[section.name] ?? section.name;
          const colors = scoreColor(section.score);
          const isWeakest = section.name === weakest;

          return (
            <div
              key={section.name}
              className={cn(
                "rounded-lg border p-3",
                isWeakest
                  ? "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30"
                  : "border-border"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">{label}</span>
                  {isWeakest && (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      Needs work
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xs font-semibold", colors.text)}>
                    {section.score}/5
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {scoreLabel(section.score)}
                  </span>
                </div>
              </div>

              <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    colors.bar
                  )}
                  style={{ width: `${(section.score / 5) * 100}%` }}
                />
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {section.feedback}
              </p>

              {section.suggestion && (
                <p className="mt-1.5 text-xs leading-relaxed text-indigo-600 dark:text-indigo-400">
                  <span className="font-medium">Tip:</span> {section.suggestion}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
