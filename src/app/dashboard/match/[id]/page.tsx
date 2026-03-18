"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
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
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  QualificationFitData,
  SectionStrengthData,
  TailoredSummaryData,
  RiskAreasData,
  InterviewFocusData,
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
    qualificationFit?: QualificationFitData;
    sectionStrength?: SectionStrengthData;
    tailoredSummary?: TailoredSummaryData;
    riskAreas?: RiskAreasData;
    interviewFocus?: InterviewFocusData;
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

        <EditableTitle initialTitle={jobTitle} matchId={match.id} />
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
        qualificationFit={match.insights.qualificationFit}
        sectionStrength={match.insights.sectionStrength}
        tailoredSummary={match.insights.tailoredSummary}
        riskAreas={match.insights.riskAreas}
        interviewFocus={match.insights.interviewFocus}
        userType={userType}
        tier={tier}
        matchId={match.id}
      />
    </div>
  );
}

function EditableTitle({
  initialTitle,
  matchId,
}: {
  initialTitle: string;
  matchId: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) {
      setDraft(title);
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });

      if (res.ok) {
        setTitle(trimmed);
        setDraft(trimmed);
      } else {
        setDraft(title);
      }
    } catch {
      setDraft(title);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }, [draft, title, matchId]);

  const cancel = useCallback(() => {
    setDraft(title);
    setEditing(false);
  }, [title]);

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          disabled={saving}
          className="h-10 max-w-lg text-2xl font-bold tracking-tight"
          aria-label="Edit job title"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={save}
          disabled={saving}
          className="h-8 w-8 shrink-0 text-green-600 hover:bg-green-50 hover:text-green-700"
          aria-label="Save title"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={cancel}
          disabled={saving}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted"
          aria-label="Cancel editing"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md p-1 text-muted-foreground/50 opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Edit job title"
      >
        <Pencil className="h-4 w-4" />
      </button>
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
