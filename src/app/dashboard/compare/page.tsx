"use client";

import { useEffect, useState } from "react";
import {
  GitCompareArrows,
  Loader2,
  AlertCircle,
  ChevronDown,
  Check,
  Sparkles,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useProfile } from "@/components/features/ProfileContext";
import {
  COMPARE_INSIGHTS,
  type CompareInsightDef,
} from "@/lib/constants/insight-defs";
import { getInsightSummary } from "@/lib/utils/insight-summary";

interface MatchEntry {
  id: string;
  overallScore: number;
  createdAt: string;
  resumeId: string | null;
  resumeFileName: string;
  candidateName: string | null;
  jobDescriptionId: string | null;
  jobTitle: string | null;
  jobCompany: string | null;
  insights: Record<string, unknown>;
}

interface ResumeOption {
  resumeId: string;
  label: string;
}

const MAX_COLUMNS = 3;

export default function ComparePage() {
  const { userType } = useProfile();
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);
  const [columnResumeIds, setColumnResumeIds] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/matches/compare");
        if (!res.ok) throw new Error("Failed to load matches");
        const json = await res.json();
        setMatches(json.data ?? []);
      } catch {
        setError("Could not load your matches.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueJds = getUniqueJds(matches);
  const uniqueResumes = getUniqueResumes(matches);

  const findMatch = (resumeId: string, jdId: string) =>
    matches.find((m) => m.resumeId === resumeId && m.jobDescriptionId === jdId);

  const setColumnAt = (index: number, resumeId: string | null) => {
    setColumnResumeIds((prev) => {
      const next = [...prev];
      next[index] = resumeId;
      return next;
    });
  };

  const usedResumeIds = new Set(columnResumeIds.filter(Boolean) as string[]);

  const handleGenerate = async (matchId: string, insightId: string) => {
    const key = `${matchId}:${insightId}`;
    setGenerating((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(`/api/v1/matches/${matchId}/insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insightId }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const json = await res.json();
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, insights: { ...m.insights, [insightId]: json.data } }
            : m
        )
      );
    } catch {
      // user can retry
    } finally {
      setGenerating((prev) => ({ ...prev, [key]: false }));
    }
  };

  const visibleInsights = getVisibleInsights(userType);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-muted-foreground">
        <GitCompareArrows className="h-10 w-10" />
        <p className="text-sm font-medium">No matches to compare</p>
        <p className="text-xs">
          Run at least two matches to start comparing insights.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header + JD selector */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Compare Results
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Compare multiple resumes against a single JD
          </p>
        </div>

        <div className="w-80">
          <DropdownSelect
            options={uniqueJds.map((j) => ({
              id: j.jobDescriptionId!,
              label: j.jobTitle ?? "Untitled JD",
            }))}
            value={selectedJdId}
            onChange={(id) => {
              setSelectedJdId(id);
              setColumnResumeIds([null, null, null]);
            }}
            placeholder="Select JD"
          />
        </div>
      </div>

      {/* Matrix table */}
      <div className="flex-1 overflow-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 z-10 min-w-[200px] bg-white px-4 py-3 text-left text-xs font-bold">
                Insights
              </th>
              {Array.from({ length: MAX_COLUMNS }).map((_, colIdx) => {
                const availableOptions = uniqueResumes.filter(
                  (r) =>
                    !usedResumeIds.has(r.resumeId) ||
                    columnResumeIds[colIdx] === r.resumeId
                );

                return (
                  <th key={colIdx} className="min-w-[260px] border-l px-4 py-3">
                    <DropdownSelect
                      options={availableOptions.map((r) => ({
                        id: r.resumeId,
                        label: r.label,
                      }))}
                      value={columnResumeIds[colIdx] ?? null}
                      onChange={(id) => setColumnAt(colIdx, id)}
                      placeholder={`Select Resume ${colIdx + 1}`}
                      disabled={!selectedJdId}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {visibleInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <tr
                  key={insight.id}
                  className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="sticky left-0 z-10 bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          insight.iconClass
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {insight.label}
                      </span>
                    </div>
                  </td>

                  {Array.from({ length: MAX_COLUMNS }).map((_, colIdx) => {
                    const resumeId = columnResumeIds[colIdx];
                    if (!resumeId || !selectedJdId) {
                      return <td key={colIdx} className="border-l px-4 py-3" />;
                    }

                    const match = findMatch(resumeId, selectedJdId);

                    if (!match) {
                      return (
                        <td
                          key={colIdx}
                          className="border-l px-4 py-3 text-center"
                        >
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Minus className="h-3 w-3 shrink-0" />
                            No match
                          </span>
                        </td>
                      );
                    }

                    const data = match.insights[insight.id];
                    const genKey = `${match.id}:${insight.id}`;
                    const isGenerating = generating[genKey];

                    return (
                      <td key={colIdx} className="border-l px-4 py-3">
                        {data ? (
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                            {getInsightSummary(
                              insight.id,
                              data as Record<string, unknown>
                            )}
                          </span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1.5 text-[11px] cursor-pointer"
                            disabled={isGenerating}
                            onClick={() => handleGenerate(match.id, insight.id)}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            {isGenerating ? "Generating…" : "Generate"}
                          </Button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────── */

function getUniqueJds(matches: MatchEntry[]) {
  const seen = new Set<string>();
  return matches.filter((m) => {
    if (!m.jobDescriptionId || seen.has(m.jobDescriptionId)) return false;
    seen.add(m.jobDescriptionId);
    return true;
  });
}

function getUniqueResumes(matches: MatchEntry[]): ResumeOption[] {
  const seen = new Set<string>();
  const result: ResumeOption[] = [];
  for (const m of matches) {
    if (!m.resumeId || seen.has(m.resumeId)) continue;
    seen.add(m.resumeId);
    result.push({
      resumeId: m.resumeId,
      label: m.candidateName ?? m.resumeFileName,
    });
  }
  return result;
}

function getVisibleInsights(userType: string): CompareInsightDef[] {
  return COMPARE_INSIGHTS.filter((i) => {
    if (i.tab === "shared") return true;
    if (i.tab === "jobseeker" && userType === "jobseeker") return true;
    if (i.tab === "business" && userType === "business") return true;
    return false;
  });
}

/* ─── Dropdown Select ──────────────────────────────────────── */

interface DropdownOption {
  id: string;
  label: string;
}

function DropdownSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  options: DropdownOption[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors cursor-pointer text-left",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[#6696C9]",
          open && "border-[#6696C9] ring-1 ring-[#6696C9]/20"
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            !selected && "text-muted-foreground"
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && options.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full min-w-[280px] overflow-y-auto rounded-lg border bg-white shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-muted/60 cursor-pointer transition-colors",
                  opt.id === value && "bg-[#6696C9]/5"
                )}
              >
                {opt.id === value ? (
                  <Check className="h-3 w-3 text-[#6696C9] shrink-0" />
                ) : (
                  <span className="w-3 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-left",
                    opt.id === value && "font-medium text-[#6696C9]"
                  )}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
