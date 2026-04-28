"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Crown, Loader2, Plus, Rocket, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/features/ResumeUpload";
import { JobDescriptionInput } from "@/components/features/JobDescriptionInput";
import { DashboardMatchResults } from "@/components/features/DashboardMatchResults";
import { useProfile } from "@/components/features/ProfileContext";
import { RATE_LIMITS } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";
import type { ParsedResume } from "@/lib/validations/parsed-resume";

interface SavedResume {
  id: string;
  fileName: string;
  fileSize: number;
  parsedData: ParsedResume;
  createdAt: string;
}
import type {
  OverallScoreData,
  SkillsBreakdownData,
  ActionItemsData,
  TopStrengthsData,
  ATSKeywordsData,
  ExperienceAlignmentData,
} from "@/services/insights/types";

type ParseStatus = "idle" | "parsing" | "parsed" | "error";
type MatchStatus = "idle" | "matching" | "matched" | "error";
const MIN_JD_WORDS = 30;
const MAX_JD_WORDS = 800;
const MAX_SLOTS = 3;
const COOLDOWN_SECONDS = 120;

interface JDEntry {
  text: string;
  sourceUrl: string | null;
}

interface ResumeEntry {
  file: File | null;
  savedInfo: { fileName: string; fileSize: number } | null;
  parsedResume: ParsedResume | null;
  parseStatus: ParseStatus;
  parseError: string | null;
}

function emptyResumeEntry(): ResumeEntry {
  return {
    file: null,
    savedInfo: null,
    parsedResume: null,
    parseStatus: "idle",
    parseError: null,
  };
}

interface MatchResultData {
  overallScore: OverallScoreData;
  skillsBreakdown: SkillsBreakdownData;
  actionItems: ActionItemsData;
  topStrengths: TopStrengthsData;
  atsKeywords: ATSKeywordsData;
  experienceAlignment: ExperienceAlignmentData;
}

interface SortedResult {
  originalIndex: number;
  result: MatchResultData;
  candidateName: string;
  jobTitle: string;
  savedMatchId: string | null;
}

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

function extractJobTitle(jdText: string): string {
  const firstLine = jdText.split("\n")[0]?.trim();
  if (firstLine && firstLine.length <= 80) return firstLine;
  return "Job Position";
}

export default function DashboardMatchPage() {
  const { userType, tier } = useProfile();
  const isBusiness = userType === "business";

  // --- Resume state ---
  const [resumeEntries, setResumeEntries] = useState<ResumeEntry[]>([
    emptyResumeEntry(),
  ]);
  const [activeResumeTab, setActiveResumeTab] = useState(0);

  // --- JD state ---
  const [jdEntries, setJdEntries] = useState<JDEntry[]>([
    { text: "", sourceUrl: null },
  ]);
  const [activeJdTab, setActiveJdTab] = useState(0);

  // --- Match state ---
  const [matchStatus, setMatchStatus] = useState<MatchStatus>("idle");
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchProgress, setMatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [matchResults, setMatchResults] = useState<(MatchResultData | null)[]>(
    []
  );
  const [matchedJdTexts, setMatchedJdTexts] = useState<string[]>([]);
  const [matchedCandidateNames, setMatchedCandidateNames] = useState<string[]>(
    []
  );
  const [savedMatchIds, setSavedMatchIds] = useState<(string | null)[]>([]);
  const [activeResultTab, setActiveResultTab] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const isPro = tier === "pro";
  const dailyLimit =
    RATE_LIMITS[userType as "jobseeker" | "business"]?.[tier as "free" | "pro"]
      ?.dailyMatches ?? 10;

  // Determine mode: multi-resume vs multi-jd vs single
  const isMultiResume = resumeEntries.length > 1;
  const isMultiJd = jdEntries.length > 1;

  useEffect(() => {
    fetch("/api/v1/matches/history?page=1&pageSize=1")
      .then((r) => r.json())
      .then((json) => {
        if (json.meta?.total != null) setMatchCount(json.meta.total);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // --- Resume handlers ---
  const updateResumeEntry = useCallback(
    (index: number, partial: Partial<ResumeEntry>) => {
      setResumeEntries((prev) =>
        prev.map((entry, i) => (i === index ? { ...entry, ...partial } : entry))
      );
    },
    []
  );

  const handleFileSelect = useCallback(
    (index: number) => async (selectedFile: File | null) => {
      updateResumeEntry(index, {
        file: selectedFile,
        savedInfo: null,
        parsedResume: null,
        parseError: null,
        parseStatus: selectedFile ? "parsing" : "idle",
      });

      setMatchStatus("idle");
      setMatchResults([]);
      setSavedMatchIds([]);

      if (!selectedFile) return;

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/v1/resumes/parse", {
          method: "POST",
          body: formData,
        });

        const json = await response.json();

        if (!response.ok) {
          updateResumeEntry(index, {
            parseError:
              json.error?.message ??
              "Failed to parse resume. Please try again.",
            parseStatus: "error",
          });
          return;
        }

        updateResumeEntry(index, {
          parsedResume: json.data.parsed,
          parseStatus: "parsed",
        });
      } catch {
        updateResumeEntry(index, {
          parseError: "Network error. Please check your connection and retry.",
          parseStatus: "error",
        });
      }
    },
    [updateResumeEntry]
  );

  const handleSavedResumeSelect = useCallback(
    (index: number) => (resume: SavedResume) => {
      updateResumeEntry(index, {
        file: null,
        savedInfo: { fileName: resume.fileName, fileSize: resume.fileSize },
        parsedResume: resume.parsedData,
        parseStatus: "parsed",
        parseError: null,
      });
      setMatchStatus("idle");
      setMatchResults([]);
      setSavedMatchIds([]);
    },
    [updateResumeEntry]
  );

  const addResumeTab = useCallback(() => {
    setResumeEntries((prev) => {
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, emptyResumeEntry()];
    });
    setActiveResumeTab((prev) =>
      resumeEntries.length < MAX_SLOTS ? resumeEntries.length : prev
    );
  }, [resumeEntries.length]);

  const removeResumeTab = useCallback(
    (index: number) => {
      if (resumeEntries.length <= 1) return;
      setResumeEntries((prev) => prev.filter((_, i) => i !== index));
      setActiveResumeTab((prev) => {
        if (prev >= index && prev > 0) return prev - 1;
        return prev;
      });
    },
    [resumeEntries.length]
  );

  // --- JD handlers ---
  const updateJdText = useCallback((index: number, text: string) => {
    setJdEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, text } : entry))
    );
  }, []);

  const updateJdSourceUrl = useCallback((index: number, url: string | null) => {
    setJdEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, sourceUrl: url } : entry
      )
    );
  }, []);

  const addJdTab = useCallback(() => {
    setJdEntries((prev) => {
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, { text: "", sourceUrl: null }];
    });
    setActiveJdTab((prev) =>
      jdEntries.length < MAX_SLOTS ? jdEntries.length : prev
    );
  }, [jdEntries.length]);

  const removeJdTab = useCallback(
    (index: number) => {
      if (jdEntries.length <= 1) return;
      setJdEntries((prev) => prev.filter((_, i) => i !== index));
      setActiveJdTab((prev) => {
        if (prev >= index && prev > 0) return prev - 1;
        return prev;
      });
    },
    [jdEntries.length]
  );

  // --- Validation ---
  const validJdIndices = jdEntries
    .map((jd, i) => ({ i, wc: countWords(jd.text) }))
    .filter(({ wc }) => wc >= MIN_JD_WORDS && wc <= MAX_JD_WORDS)
    .map(({ i }) => i);

  const validResumeIndices = resumeEntries
    .map((r, i) => ({ i, ready: r.parsedResume !== null }))
    .filter(({ ready }) => ready)
    .map(({ i }) => i);

  const activeEntry = resumeEntries[activeResumeTab];
  const primaryResume = resumeEntries[0];
  const hasPrimaryResume =
    primaryResume?.parsedResume !== null &&
    (primaryResume?.file !== null || primaryResume?.savedInfo !== null);

  const isReady = isMultiResume
    ? validResumeIndices.length > 0 && validJdIndices.length === 1
    : hasPrimaryResume && validJdIndices.length > 0;

  // --- Matching ---
  const handleStartMatching = useCallback(async () => {
    if (!isReady) return;

    setMatchStatus("matching");
    setMatchError(null);
    setMatchResults([]);
    setSavedMatchIds([]);
    setMatchedJdTexts([]);
    setMatchedCandidateNames([]);

    const results: (MatchResultData | null)[] = [];
    const savedIds: (string | null)[] = [];
    const jdTexts: string[] = [];
    const candidateNames: string[] = [];

    try {
      if (isMultiResume) {
        // Multi-resume mode: multiple resumes against single JD
        const jdIdx = validJdIndices[0]!;
        const jd = jdEntries[jdIdx]!;
        const resumesToMatch = validResumeIndices
          .map((i) => resumeEntries[i])
          .filter((r): r is ResumeEntry => r != null && r.parsedResume != null);

        setMatchProgress({ current: 0, total: resumesToMatch.length });

        let progressIdx = 0;
        for (const entry of resumesToMatch) {
          progressIdx++;
          setMatchProgress({
            current: progressIdx,
            total: resumesToMatch.length,
          });

          const response = await fetch("/api/v1/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume: entry.parsedResume,
              jobDescription: jd.text,
            }),
          });

          const json = await response.json();

          if (!response.ok) {
            results.push(null);
            savedIds.push(null);
            jdTexts.push(jd.text);
            candidateNames.push(entry.parsedResume?.name ?? "Candidate");
            continue;
          }

          const resultData: MatchResultData = {
            overallScore: json.data.overallScore.data,
            skillsBreakdown: json.data.skillsBreakdown.data,
            actionItems: json.data.actionItems.data,
            topStrengths: json.data.topStrengths.data,
            atsKeywords: json.data.atsKeywords.data,
            experienceAlignment: json.data.experienceAlignment.data,
          };

          results.push(resultData);
          jdTexts.push(jd.text);
          candidateNames.push(entry.parsedResume?.name ?? "Candidate");

          const resumeFileName =
            entry.file?.name ?? entry.savedInfo?.fileName ?? "resume.pdf";
          const resumeFileType = entry.file?.type ?? "application/pdf";
          const resumeFileSize =
            entry.file?.size ?? entry.savedInfo?.fileSize ?? 0;

          const saveId = await fetch("/api/v1/matches/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeFileName,
              resumeFileType,
              resumeFileSize,
              resumeParsedData: entry.parsedResume,
              jobDescriptionText: jd.text,
              jobSourceUrl: jd.sourceUrl,
              insights: resultData,
            }),
          })
            .then((r) => r.json())
            .then((j) => j.data?.matchId ?? null)
            .catch(() => null);

          savedIds.push(saveId);
        }

        setMatchCount((prev) => prev + resumesToMatch.length);
      } else {
        // Single/multi-JD mode: one resume against multiple JDs
        const resume = resumeEntries[0]!;
        const resumeFileName =
          resume.file?.name ?? resume.savedInfo?.fileName ?? "resume.pdf";
        const resumeFileType = resume.file?.type ?? "application/pdf";
        const resumeFileSize =
          resume.file?.size ?? resume.savedInfo?.fileSize ?? 0;
        const candidateName = resume.parsedResume?.name ?? "Candidate";

        const jdsToMatch = validJdIndices
          .map((i) => jdEntries[i])
          .filter((jd): jd is JDEntry => jd != null);

        setMatchProgress({ current: 0, total: jdsToMatch.length });

        let progressIdx = 0;
        for (const jd of jdsToMatch) {
          progressIdx++;
          setMatchProgress({ current: progressIdx, total: jdsToMatch.length });

          const response = await fetch("/api/v1/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resume: resume.parsedResume,
              jobDescription: jd.text,
            }),
          });

          const json = await response.json();

          if (!response.ok) {
            results.push(null);
            savedIds.push(null);
            jdTexts.push(jd.text);
            candidateNames.push(candidateName);
            continue;
          }

          const resultData: MatchResultData = {
            overallScore: json.data.overallScore.data,
            skillsBreakdown: json.data.skillsBreakdown.data,
            actionItems: json.data.actionItems.data,
            topStrengths: json.data.topStrengths.data,
            atsKeywords: json.data.atsKeywords.data,
            experienceAlignment: json.data.experienceAlignment.data,
          };

          results.push(resultData);
          jdTexts.push(jd.text);
          candidateNames.push(candidateName);

          const saveId = await fetch("/api/v1/matches/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeFileName,
              resumeFileType,
              resumeFileSize,
              resumeParsedData: resume.parsedResume,
              jobDescriptionText: jd.text,
              jobSourceUrl: jd.sourceUrl,
              insights: resultData,
            }),
          })
            .then((r) => r.json())
            .then((j) => j.data?.matchId ?? null)
            .catch(() => null);

          savedIds.push(saveId);
        }

        setMatchCount((prev) => prev + jdsToMatch.length);
      }

      setMatchResults(results);
      setSavedMatchIds(savedIds);
      setMatchedJdTexts(jdTexts);
      setMatchedCandidateNames(candidateNames);
      setMatchStatus("matched");
      setCooldown(COOLDOWN_SECONDS);
      setActiveResultTab(0);
      setMatchProgress(null);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch {
      setMatchError("Network error. Please check your connection and retry.");
      setMatchStatus("error");
      setMatchProgress(null);
    }
  }, [
    isReady,
    isMultiResume,
    resumeEntries,
    jdEntries,
    validJdIndices,
    validResumeIndices,
  ]);

  const handleReset = () => {
    setResumeEntries([emptyResumeEntry()]);
    setActiveResumeTab(0);
    setJdEntries([{ text: "", sourceUrl: null }]);
    setActiveJdTab(0);
    setMatchStatus("idle");
    setMatchError(null);
    setMatchResults([]);
    setSavedMatchIds([]);
    setMatchedJdTexts([]);
    setMatchedCandidateNames([]);
    setActiveResultTab(0);
    setMatchProgress(null);
  };

  const isCoolingDown = cooldown > 0;
  const activeJdWordCount = jdEntries[activeJdTab]
    ? countWords(jdEntries[activeJdTab].text)
    : 0;
  const successfulResults = matchResults.filter(
    (r): r is MatchResultData => r !== null
  );

  // Build sorted results for display (sorted by score desc)
  const sortedResults: SortedResult[] = matchResults
    .map((result, i) => {
      if (!result) return null;
      return {
        originalIndex: i,
        result,
        candidateName: matchedCandidateNames[i] ?? "Candidate",
        jobTitle: extractJobTitle(matchedJdTexts[i] ?? ""),
        savedMatchId: savedMatchIds[i] ?? null,
      };
    })
    .filter((r): r is SortedResult => r !== null)
    .sort(
      (a, b) => b.result.overallScore.overall - a.result.overallScore.overall
    );

  const activeSort = sortedResults[activeResultTab];

  // CTA label
  const ctaLabel = (() => {
    if (successfulResults.length > 0) return "Match Again";
    if (isMultiResume && validResumeIndices.length > 1)
      return `Match ${validResumeIndices.length} Resumes`;
    if (!isMultiResume && validJdIndices.length > 1)
      return `Match Against ${validJdIndices.length} Jobs`;
    return "Start Matching";
  })();

  // Help text
  const helpText = (() => {
    if (activeEntry?.parseStatus === "parsing") return "Parsing your resume...";
    if (!hasPrimaryResume && !jdEntries.some((j) => j.text.trim()))
      return "Upload a resume or select a saved one, and paste a job description to begin";
    if (isMultiResume && validResumeIndices.length === 0)
      return "Add at least one valid resume to begin";
    if (!isMultiResume && !hasPrimaryResume)
      return "Upload a resume or select a saved one to continue";
    if (activeJdWordCount > 0 && activeJdWordCount < MIN_JD_WORDS)
      return `Add more to the job description (${MIN_JD_WORDS - activeJdWordCount} more words needed)`;
    if (activeJdWordCount > MAX_JD_WORDS)
      return `Job description is too long (${activeJdWordCount - MAX_JD_WORDS} words over limit)`;
    if (validJdIndices.length === 0)
      return "Add at least one valid job description to begin";
    return "";
  })();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Match</h1>
          <p className="text-sm text-muted-foreground">
            {isMultiResume
              ? `Upload up to ${MAX_SLOTS} resumes and paste a job description to compare candidates.`
              : `Upload a resume and paste up to ${MAX_SLOTS} job descriptions to get insights.`}
          </p>
        </div>
        {successfulResults.length > 0 && (
          <div className="flex items-center gap-3">
            {!isPro && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${
                      matchCount >= dailyLimit ? "bg-red-500" : "bg-[#6696C9]"
                    }`}
                    style={{
                      width: `${Math.min((matchCount / dailyLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span>
                  {matchCount}/{dailyLimit} today
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isCoolingDown}
              className="gap-1.5"
            >
              {isCoolingDown ? (
                <>
                  <Timer className="h-3.5 w-3.5" />
                  Re-run in {formatCountdown(cooldown)}
                </>
              ) : (
                "Re-run Matching"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Column 1: Resume(s) */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isMultiResume ? "Resumes" : "Your Resume"}
            </h2>
          </div>

          {/* Resume Tabs */}
          <div className="mb-3 flex items-center gap-1.5">
            {resumeEntries.map((entry, i) => {
              const hasContent =
                entry.parsedResume !== null ||
                entry.file !== null ||
                entry.savedInfo !== null;
              const isParsed = entry.parseStatus === "parsed";

              return (
                <div
                  key={i}
                  role="tab"
                  tabIndex={0}
                  onClick={() => setActiveResumeTab(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveResumeTab(i);
                    }
                  }}
                  className={cn(
                    "group relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                    activeResumeTab === i
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <span>Resume {i + 1}</span>
                  {hasContent && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isParsed ? "bg-emerald-500" : "bg-amber-400"
                      )}
                    />
                  )}
                  {resumeEntries.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeResumeTab(i);
                      }}
                      className="ml-0.5 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted-foreground/10 hover:text-foreground group-hover:opacity-100 cursor-pointer"
                      aria-label={`Remove Resume ${i + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Resume button — business only, hidden in multi-JD mode */}
            {isBusiness &&
              !isMultiJd &&
              (resumeEntries.length < MAX_SLOTS ? (
                <button
                  onClick={addResumeTab}
                  className="flex items-center gap-1 rounded-lg border border-dashed border-muted-foreground/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer"
                  aria-label="Add another resume"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Resume
                </button>
              ) : (
                <span className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-300 px-2.5 py-1.5 text-xs font-medium text-amber-700">
                  <Crown className="h-3.5 w-3.5" />
                  Upgrade to add more
                </span>
              ))}
          </div>

          {/* Resume upload area */}
          <div className="min-h-[400px] flex-1">
            {resumeEntries.map((entry, i) => (
              <div
                key={i}
                className={activeResumeTab === i ? "block h-full" : "hidden"}
              >
                <ResumeUpload
                  file={entry.file}
                  onFileSelect={handleFileSelect(i)}
                  onParsed={(parsed) =>
                    updateResumeEntry(i, { parsedResume: parsed })
                  }
                  parsedResume={entry.parsedResume}
                  parseStatus={entry.parseStatus}
                  parseError={entry.parseError}
                  isLoggedIn
                  onSavedResumeSelect={handleSavedResumeSelect(i)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Job Description(s) */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Job Description
            </h2>
          </div>

          {/* JD Tabs */}
          <div className="mb-3 flex items-center gap-1.5">
            {jdEntries.map((jd, i) => {
              const wc = countWords(jd.text);
              const isValid = wc >= MIN_JD_WORDS && wc <= MAX_JD_WORDS;
              const hasContent = wc > 0;

              return (
                <div
                  key={i}
                  role="tab"
                  tabIndex={0}
                  onClick={() => setActiveJdTab(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveJdTab(i);
                    }
                  }}
                  className={cn(
                    "group relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                    activeJdTab === i
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <span>JD {i + 1}</span>
                  {hasContent && (
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isValid ? "bg-emerald-500" : "bg-amber-400"
                      )}
                    />
                  )}
                  {jdEntries.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeJdTab(i);
                      }}
                      className="ml-0.5 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted-foreground/10 hover:text-foreground group-hover:opacity-100 cursor-pointer"
                      aria-label={`Remove JD ${i + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add JD button — hidden when in multi-resume mode */}
            {!isMultiResume &&
              (jdEntries.length < MAX_SLOTS ? (
                <button
                  onClick={addJdTab}
                  className="flex items-center gap-1 rounded-lg border border-dashed border-muted-foreground/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer"
                  aria-label="Add another job description"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add JD
                </button>
              ) : (
                <span className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-300 px-2.5 py-1.5 text-xs font-medium text-amber-700">
                  <Crown className="h-3.5 w-3.5" />
                  Upgrade to add more
                </span>
              ))}
          </div>

          {/* Render all JD inputs, show only active one */}
          <div className="flex-1">
            {jdEntries.map((jd, i) => (
              <div
                key={i}
                className={activeJdTab === i ? "block h-full" : "hidden"}
              >
                <JobDescriptionInput
                  value={jd.text}
                  onChange={(val) => updateJdText(i, val)}
                  onSourceUrlChange={(url) => updateJdSourceUrl(i, url)}
                  showSavedSearch
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button
          size="lg"
          disabled={!isReady || matchStatus === "matching"}
          onClick={handleStartMatching}
          className="h-14 px-10 text-base font-semibold transition-colors disabled:opacity-50"
        >
          {matchStatus === "matching" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {matchProgress && matchProgress.total > 1
                ? `Analyzing ${matchProgress.current} of ${matchProgress.total}...`
                : "Analyzing..."}
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              {ctaLabel}
            </>
          )}
        </Button>

        {matchStatus === "matching" && (
          <p className="text-sm text-muted-foreground">
            Reading resume &rarr; Analyzing job &rarr; Matching skills &rarr;
            Generating insights&hellip;
          </p>
        )}

        {matchStatus === "error" && (
          <p className="text-sm text-destructive">{matchError}</p>
        )}

        {matchStatus === "idle" && !isReady && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
      </div>

      {/* Results */}
      {sortedResults.length > 0 && (
        <div ref={resultsRef} className="mt-10 border-t pt-10">
          {/* Result tabs — centered, sorted by score */}
          {sortedResults.length > 1 && (
            <div className="mb-2 flex flex-col items-center">
              <div className="flex items-center gap-2">
                {sortedResults.map((sr, i) => {
                  const score = sr.result.overallScore.overall;
                  return (
                    <button
                      key={sr.originalIndex}
                      onClick={() => setActiveResultTab(i)}
                      className={cn(
                        "relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all cursor-pointer",
                        activeResultTab === i
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-muted bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
                      )}
                    >
                      <span>Result {i + 1}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-bold",
                          score >= 70
                            ? "bg-emerald-100 text-emerald-700"
                            : score >= 40
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        )}
                      >
                        {score}%
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Candidate name + job title for active result */}
              {activeSort && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {activeSort.candidateName}
                  </span>
                  {" for "}
                  <span className="font-medium text-foreground">
                    {activeSort.jobTitle}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Single result context */}
          {sortedResults.length === 1 && activeSort && (
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {activeSort.candidateName}
                </span>
                {" for "}
                <span className="font-medium text-foreground">
                  {activeSort.jobTitle}
                </span>
              </p>
            </div>
          )}

          {/* Active result content */}
          {activeSort && (
            <DashboardMatchResults
              score={{
                overall: activeSort.result.overallScore.overall,
                dimensions: activeSort.result.overallScore.dimensions,
                summary: activeSort.result.overallScore.summary,
              }}
              skillsBreakdown={activeSort.result.skillsBreakdown}
              actionItems={activeSort.result.actionItems}
              topStrengths={activeSort.result.topStrengths}
              atsKeywords={activeSort.result.atsKeywords}
              experienceAlignment={activeSort.result.experienceAlignment}
              userType={userType}
              tier={tier}
              matchId={activeSort.savedMatchId ?? undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
