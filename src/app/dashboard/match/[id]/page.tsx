"use client";

import { useEffect, useReducer, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardMatchResults } from "@/components/features/DashboardMatchResults";
import { useProfile } from "@/components/features/ProfileContext";
import type {
  OverallScoreData,
  SkillsBreakdownData,
  ActionItemsData,
  TopStrengthsData,
  ATSKeywordsData,
  ExperienceAlignmentData,
} from "@/services/insights/types";

interface MatchDetail {
  id: string;
  overallScore: number;
  createdAt: string;
  resume: {
    fileName: string;
    parsedData: Record<string, unknown> | null;
  };
  jobDescription: {
    title: string | null;
    company: string | null;
    rawText: string;
    sourceUrl: string | null;
  };
  insights: {
    overallScore: OverallScoreData;
    skillsBreakdown: SkillsBreakdownData;
    actionItems: ActionItemsData;
    topStrengths: TopStrengthsData;
    atsKeywords: ATSKeywordsData;
    experienceAlignment: ExperienceAlignmentData;
  };
}

type DetailState =
  | { status: "loading" }
  | { status: "loaded"; match: MatchDetail }
  | { status: "error"; message: string };

type DetailAction =
  | { type: "loading" }
  | { type: "loaded"; match: MatchDetail }
  | { type: "error"; message: string };

function reducer(_state: DetailState, action: DetailAction): DetailState {
  switch (action.type) {
    case "loading":
      return { status: "loading" };
    case "loaded":
      return { status: "loaded", match: action.match };
    case "error":
      return { status: "error", message: action.message };
  }
}

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const { userType, tier } = useProfile();
  const [state, dispatch] = useReducer(reducer, { status: "loading" });

  useEffect(() => {
    async function load() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`/api/v1/matches/${params.id}`);
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          dispatch({
            type: "error",
            message:
              json?.error?.message ??
              "Failed to load match. It may have been deleted.",
          });
          return;
        }
        const json = await res.json();
        dispatch({ type: "loaded", match: json.data });
      } catch {
        dispatch({
          type: "error",
          message: "Network error. Please try again.",
        });
      }
    }
    load();
  }, [params.id]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Loading match results...
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/history">Back to History</Link>
        </Button>
      </div>
    );
  }

  const { match } = state;
  const dateStr = new Date(match.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = new Date(match.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const jobTitle = match.jobDescription.title ?? "Untitled Position";

  return (
    <div>
      <div className="mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-4 gap-1.5 text-muted-foreground"
        >
          <Link href="/dashboard/history">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">{jobTitle}</h1>
        {match.jobDescription.company && (
          <p className="text-muted-foreground">
            {match.jobDescription.company}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            {match.resume.fileName}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {dateStr} at {timeStr}
          </span>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <ResumeDetailPanel parsedData={match.resume.parsedData} />
        <JobDetailPanel
          rawText={match.jobDescription.rawText}
          sourceUrl={match.jobDescription.sourceUrl}
        />
      </div>

      <DashboardMatchResults
        score={{
          overall: match.insights.overallScore.overall,
          dimensions: match.insights.overallScore.dimensions,
          summary: match.insights.overallScore.summary,
        }}
        skillsBreakdown={match.insights.skillsBreakdown}
        actionItems={match.insights.actionItems}
        topStrengths={match.insights.topStrengths}
        atsKeywords={match.insights.atsKeywords}
        experienceAlignment={match.insights.experienceAlignment}
        userType={userType}
        tier={tier}
      />
    </div>
  );
}

function ResumeDetailPanel({
  parsedData,
}: {
  parsedData: Record<string, unknown> | null;
}) {
  const [open, setOpen] = useState(false);

  if (!parsedData) return null;

  const name = (parsedData.name as string) ?? "Unknown";
  const email = parsedData.email as string | undefined;
  const phone = parsedData.phone as string | undefined;
  const skills = parsedData.skills as string[] | undefined;
  const experience = parsedData.experience as
    | Array<{ title?: string; company?: string; years?: number }>
    | undefined;
  const education = parsedData.education as
    | Array<{ degree?: string; institution?: string }>
    | undefined;

  return (
    <Card>
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/40"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <User className="h-4 w-4 text-[#6696C9]" />
            Parsed Resume
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {open && (
          <div className="space-y-4 border-t px-5 py-4 text-sm">
            <div>
              <p className="font-semibold">{name}</p>
              {email && (
                <p className="text-xs text-muted-foreground">{email}</p>
              )}
              {phone && (
                <p className="text-xs text-muted-foreground">{phone}</p>
              )}
            </div>

            {skills && skills.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border bg-muted/50 px-2 py-0.5 text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {experience && experience.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Experience
                </p>
                <ul className="space-y-1">
                  {experience.map((exp, i) => (
                    <li key={i} className="text-xs">
                      <span className="font-medium">{exp.title}</span>
                      {exp.company && (
                        <span className="text-muted-foreground">
                          {" "}
                          at {exp.company}
                        </span>
                      )}
                      {exp.years != null && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({exp.years}y)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {education && education.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Education
                </p>
                <ul className="space-y-1">
                  {education.map((edu, i) => (
                    <li key={i} className="text-xs">
                      <span className="font-medium">{edu.degree}</span>
                      {edu.institution && (
                        <span className="text-muted-foreground">
                          {" "}
                          — {edu.institution}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JobDetailPanel({
  rawText,
  sourceUrl,
}: {
  rawText: string;
  sourceUrl: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/40"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Briefcase className="h-4 w-4 text-[#6696C9]" />
            Job Details
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {open && (
          <div className="border-t px-5 py-4">
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 inline-flex items-center gap-1.5 text-sm text-[#6696C9] hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Original Posting
              </a>
            )}
            <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
              {rawText}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
