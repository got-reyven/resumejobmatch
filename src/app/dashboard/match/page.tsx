"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Plus, Rocket, Timer, X } from "lucide-react";
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
const MAX_JDS = 3;
const COOLDOWN_SECONDS = 120;

interface JDEntry {
  text: string;
  sourceUrl: string | null;
}

interface MatchResultData {
  overallScore: OverallScoreData;
  skillsBreakdown: SkillsBreakdownData;
  actionItems: ActionItemsData;
  topStrengths: TopStrengthsData;
  atsKeywords: ATSKeywordsData;
  experienceAlignment: ExperienceAlignmentData;
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
  const [file, setFile] = useState<File | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseStatus>("idle");
  const [parseError, setParseError] = useState<string | null>(null);

  const [jdEntries, setJdEntries] = useState<JDEntry[]>([
    { text: "", sourceUrl: null },
  ]);
  const [activeJdTab, setActiveJdTab] = useState(0);

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
  const [savedMatchIds, setSavedMatchIds] = useState<(string | null)[]>([]);
  const [activeResultTab, setActiveResultTab] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [savedResumeInfo, setSavedResumeInfo] = useState<{
    fileName: string;
    fileSize: number;
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { userType, tier } = useProfile();

  const isPro = tier === "pro";
  const dailyLimit =
    RATE_LIMITS[userType as "jobseeker" | "business"]?.[tier as "free" | "pro"]
      ?.dailyMatches ?? 10;

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

  const validJdIndices = jdEntries
    .map((jd, i) => ({ i, wc: countWords(jd.text) }))
    .filter(({ wc }) => wc >= MIN_JD_WORDS && wc <= MAX_JD_WORDS)
    .map(({ i }) => i);

  const hasResume =
    parsedResume !== null && (file !== null || savedResumeInfo !== null);
  const isReady = hasResume && validJdIndices.length > 0;

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
      if (prev.length >= MAX_JDS) return prev;
      return [...prev, { text: "", sourceUrl: null }];
    });
    setActiveJdTab((prev) =>
      jdEntries.length < MAX_JDS ? jdEntries.length : prev
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

  const handleSavedResumeSelect = useCallback((resume: SavedResume) => {
    setFile(null);
    setSavedResumeInfo({
      fileName: resume.fileName,
      fileSize: resume.fileSize,
    });
    setParsedResume(resume.parsedData);
    setParseStatus("parsed");
    setParseError(null);
    setMatchStatus("idle");
    setMatchResults([]);
    setSavedMatchIds([]);
    setMatchedJdTexts([]);
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    setFile(selectedFile);
    setSavedResumeInfo(null);
    setParsedResume(null);
    setParseError(null);
    setMatchStatus("idle");
    setMatchResults([]);
    setSavedMatchIds([]);
    setMatchedJdTexts([]);

    if (!selectedFile) {
      setParseStatus("idle");
      return;
    }

    setParseStatus("parsing");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/v1/resumes/parse", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        const message =
          json.error?.message ?? "Failed to parse resume. Please try again.";
        setParseError(message);
        setParseStatus("error");
        return;
      }

      setParsedResume(json.data.parsed);
      setParseStatus("parsed");
    } catch {
      setParseError("Network error. Please check your connection and retry.");
      setParseStatus("error");
    }
  }, []);

  const handleStartMatching = useCallback(async () => {
    if (!isReady || !parsedResume) return;

    const resumeFileName =
      file?.name ?? savedResumeInfo?.fileName ?? "resume.pdf";
    const resumeFileType = file?.type ?? "application/pdf";
    const resumeFileSize = file?.size ?? savedResumeInfo?.fileSize ?? 0;

    const jdsToMatch = validJdIndices.map((i) => jdEntries[i]);

    setMatchStatus("matching");
    setMatchError(null);
    setMatchResults([]);
    setSavedMatchIds([]);
    setMatchedJdTexts(jdsToMatch.map((jd) => jd.text));
    setMatchProgress({ current: 0, total: jdsToMatch.length });

    const results: (MatchResultData | null)[] = [];
    const savedIds: (string | null)[] = [];

    try {
      for (let idx = 0; idx < jdsToMatch.length; idx++) {
        const jd = jdsToMatch[idx];
        setMatchProgress({ current: idx + 1, total: jdsToMatch.length });

        const response = await fetch("/api/v1/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume: parsedResume,
            jobDescription: jd.text,
          }),
        });

        const json = await response.json();

        if (!response.ok) {
          results.push(null);
          savedIds.push(null);
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

        const saveId = await fetch("/api/v1/matches/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeFileName,
            resumeFileType,
            resumeFileSize,
            resumeParsedData: parsedResume,
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

      setMatchResults(results);
      setSavedMatchIds(savedIds);
      setMatchStatus("matched");
      setMatchCount((prev) => prev + jdsToMatch.length);
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
  }, [isReady, parsedResume, jdEntries, validJdIndices, file, savedResumeInfo]);

  const handleReset = () => {
    setFile(null);
    setSavedResumeInfo(null);
    setParsedResume(null);
    setParseStatus("idle");
    setParseError(null);
    setJdEntries([{ text: "", sourceUrl: null }]);
    setActiveJdTab(0);
    setMatchStatus("idle");
    setMatchError(null);
    setMatchResults([]);
    setSavedMatchIds([]);
    setMatchedJdTexts([]);
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

  const candidateName = parsedResume?.name ?? "Candidate";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Match</h1>
          <p className="text-sm text-muted-foreground">
            Upload a resume and paste up to {MAX_JDS} job descriptions to get
            insights.
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
        {/* Column 1: Resume */}
        <div className="flex flex-col">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Your Resume
            </h2>
          </div>
          <div className="min-h-[400px] flex-1">
            <ResumeUpload
              file={file}
              onFileSelect={handleFileSelect}
              onParsed={setParsedResume}
              parsedResume={parsedResume}
              parseStatus={parseStatus}
              parseError={parseError}
              isLoggedIn
              onSavedResumeSelect={handleSavedResumeSelect}
            />
          </div>
        </div>

        {/* Column 2: Job Descriptions */}
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
                    "group relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
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
                      className="ml-0.5 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted-foreground/10 hover:text-foreground group-hover:opacity-100"
                      aria-label={`Remove JD ${i + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {jdEntries.length < MAX_JDS && (
              <button
                onClick={addJdTab}
                className="flex items-center gap-1 rounded-lg border border-dashed border-muted-foreground/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                aria-label="Add another job description"
              >
                <Plus className="h-3.5 w-3.5" />
                Add JD
              </button>
            )}
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
              {successfulResults.length > 0
                ? "Match Again"
                : validJdIndices.length > 1
                  ? `Match Against ${validJdIndices.length} Jobs`
                  : "Start Matching"}
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
          <p className="text-sm text-muted-foreground">
            {parseStatus === "parsing"
              ? "Parsing your resume..."
              : !hasResume && !jdEntries.some((j) => j.text.trim())
                ? "Upload a resume or select a saved one, and paste a job description to begin"
                : !hasResume
                  ? "Upload a resume or select a saved one to continue"
                  : activeJdWordCount > 0 && activeJdWordCount < MIN_JD_WORDS
                    ? `Add more to the job description (${MIN_JD_WORDS - activeJdWordCount} more words needed)`
                    : activeJdWordCount > MAX_JD_WORDS
                      ? `Job description is too long (${activeJdWordCount - MAX_JD_WORDS} words over limit)`
                      : validJdIndices.length === 0
                        ? "Add at least one valid job description to begin"
                        : ""}
          </p>
        )}
      </div>

      {/* Results */}
      {successfulResults.length > 0 && (
        <div ref={resultsRef} className="mt-10 border-t pt-10">
          {/* Result tabs - centered */}
          {successfulResults.length > 1 && (
            <div className="mb-2 flex flex-col items-center">
              <div className="flex items-center gap-2">
                {matchResults.map((result, i) => {
                  if (!result) return null;
                  const resultNumber = matchResults
                    .slice(0, i + 1)
                    .filter((r) => r !== null).length;
                  const score = result.overallScore.overall;

                  return (
                    <button
                      key={i}
                      onClick={() => setActiveResultTab(i)}
                      className={cn(
                        "relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                        activeResultTab === i
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-muted bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/50"
                      )}
                    >
                      <span>Result {resultNumber}</span>
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
              {matchedJdTexts[activeResultTab] && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {candidateName}
                  </span>
                  {" as "}
                  <span className="font-medium text-foreground">
                    {extractJobTitle(matchedJdTexts[activeResultTab])}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Single result: still show candidate + job context */}
          {successfulResults.length === 1 && matchedJdTexts[0] && (
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {candidateName}
                </span>
                {" as "}
                <span className="font-medium text-foreground">
                  {extractJobTitle(matchedJdTexts[0])}
                </span>
              </p>
            </div>
          )}

          {/* Active result content */}
          {matchResults[activeResultTab] && (
            <DashboardMatchResults
              score={{
                overall: matchResults[activeResultTab]!.overallScore.overall,
                dimensions:
                  matchResults[activeResultTab]!.overallScore.dimensions,
                summary: matchResults[activeResultTab]!.overallScore.summary,
              }}
              skillsBreakdown={matchResults[activeResultTab]!.skillsBreakdown}
              actionItems={matchResults[activeResultTab]!.actionItems}
              topStrengths={matchResults[activeResultTab]!.topStrengths}
              atsKeywords={matchResults[activeResultTab]!.atsKeywords}
              experienceAlignment={
                matchResults[activeResultTab]!.experienceAlignment
              }
              userType={userType}
              tier={tier}
              matchId={savedMatchIds[activeResultTab] ?? undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}
