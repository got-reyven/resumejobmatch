"use client";

import { Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DimensionScore {
  label: string;
  score: number;
  weight: string;
  description: string;
}

export interface MatchScoreDisplayProps {
  overall: number;
  dimensions: {
    skills: number;
    experience: number;
    qualifications: number;
    overall_fit: number;
  };
  summary: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 60) return "stroke-yellow-500";
  if (score >= 40) return "stroke-orange-500";
  return "stroke-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Moderate Match";
  if (score >= 40) return "Weak Match";
  return "Poor Match";
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function ScoreRing({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90" aria-hidden="true">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-muted"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-1000 ease-out",
            getScoreRingColor(score)
          )}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-3xl font-bold", getScoreColor(score))}>
          {score}%
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, weight, description }: DimensionScore) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          <span
            className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            title={description}
          >
            {weight} weight
          </span>
        </div>
        <span className={cn("font-semibold", getScoreColor(score))}>
          {score}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            getBarColor(score)
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function MatchScoreDisplay({
  overall,
  dimensions,
  summary,
}: MatchScoreDisplayProps) {
  const dimensionList: DimensionScore[] = [
    {
      label: "Skills",
      score: dimensions.skills,
      weight: "40%",
      description: "Required and preferred skills coverage",
    },
    {
      label: "Experience",
      score: dimensions.experience,
      weight: "30%",
      description: "Years, seniority, and domain relevance",
    },
    {
      label: "Qualifications",
      score: dimensions.qualifications,
      weight: "20%",
      description: "Degrees, certifications, clearances",
    },
    {
      label: "Overall Fit",
      score: dimensions.overall_fit,
      weight: "10%",
      description: "Industry alignment and career trajectory",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Target className="h-5 w-5 text-primary" aria-hidden="true" />
        Overall Match Score
      </h3>

      <div className="flex flex-col items-center gap-5">
        <ScoreRing score={overall} />

        <div className="w-full space-y-3">
          {dimensionList.map((dim) => (
            <DimensionBar key={dim.label} {...dim} />
          ))}
        </div>

        <p className="mt-1 text-center text-sm text-muted-foreground">
          {summary}
        </p>
      </div>
    </div>
  );
}
