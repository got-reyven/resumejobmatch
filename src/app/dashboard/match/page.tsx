"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Rocket, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/features/ResumeUpload";
import { JobDescriptionInput } from "@/components/features/JobDescriptionInput";
import { DashboardMatchResults } from "@/components/features/DashboardMatchResults";
import { useProfile } from "@/components/features/ProfileContext";
import { RATE_LIMITS } from "@/lib/constants/app";
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
  QualificationFitData,
} from "@/services/insights/types";

type ParseStatus = "idle" | "parsing" | "parsed" | "error";
type MatchStatus = "idle" | "matching" | "matched" | "error";
const MIN_JD_WORDS = 30;
const MAX_JD_WORDS = 800;
const COOLDOWN_SECONDS = 120;

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export default function DashboardMatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseStatus>("idle");
  const [parseError, setParseError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");

  const [matchStatus, setMatchStatus] = useState<MatchStatus>("idle");
  const [matchError, setMatchError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<{
    overallScore: OverallScoreData;
    skillsBreakdown: SkillsBreakdownData;
    actionItems: ActionItemsData;
    topStrengths: TopStrengthsData;
    atsKeywords: ATSKeywordsData;
    experienceAlignment: ExperienceAlignmentData;
    qualificationFit?: QualificationFitData;
  } | null>(null);
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

  const jdWordCount = countWords(jobDescription);
  const hasResume =
    parsedResume !== null && (file !== null || savedResumeInfo !== null);
  const isReady =
    hasResume && jdWordCount >= MIN_JD_WORDS && jdWordCount <= MAX_JD_WORDS;

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
    setMatchResult(null);
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    setFile(selectedFile);
    setSavedResumeInfo(null);
    setParsedResume(null);
    setParseError(null);
    setMatchStatus("idle");
    setMatchResult(null);

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

    setMatchStatus("matching");
    setMatchError(null);
    setMatchResult(null);

    try {
      const response = await fetch("/api/v1/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: parsedResume, jobDescription }),
      });

      const json = await response.json();

      if (!response.ok) {
        setMatchError(
          json.error?.message ?? "Matching failed. Please try again."
        );
        setMatchStatus("error");
        return;
      }

      const resultData = {
        overallScore: json.data.overallScore.data,
        skillsBreakdown: json.data.skillsBreakdown.data,
        actionItems: json.data.actionItems.data,
        topStrengths: json.data.topStrengths.data,
        atsKeywords: json.data.atsKeywords.data,
        experienceAlignment: json.data.experienceAlignment.data,
        qualificationFit: json.data.qualificationFit?.data,
      };

      setMatchResult(resultData);
      setMatchStatus("matched");
      setMatchCount((prev) => prev + 1);
      setCooldown(COOLDOWN_SECONDS);

      fetch("/api/v1/matches/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeFileName,
          resumeFileType,
          resumeFileSize,
          resumeParsedData: parsedResume,
          jobDescriptionText: jobDescription,
          insights: resultData,
        }),
      }).catch((err) => console.error("Failed to save match:", err));

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch {
      setMatchError("Network error. Please check your connection and retry.");
      setMatchStatus("error");
    }
  }, [isReady, parsedResume, jobDescription, file, savedResumeInfo]);

  const handleReset = () => {
    setFile(null);
    setSavedResumeInfo(null);
    setParsedResume(null);
    setParseStatus("idle");
    setParseError(null);
    setJobDescription("");
    setMatchStatus("idle");
    setMatchError(null);
    setMatchResult(null);
  };

  const isCoolingDown = cooldown > 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Match</h1>
          <p className="text-sm text-muted-foreground">
            Upload a resume and paste a job description to get insights.
          </p>
        </div>
        {matchResult && (
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

        <div className="flex flex-col">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Job Description
            </h2>
          </div>
          <div className="flex-1">
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
            />
          </div>
        </div>
      </div>

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
              Analyzing...
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              {matchResult ? "Match Again" : "Start Matching"}
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
              : !hasResume && !jobDescription
                ? "Upload a resume or select a saved one, and paste a job description to begin"
                : !hasResume
                  ? "Upload a resume or select a saved one to continue"
                  : jdWordCount < MIN_JD_WORDS
                    ? `Add more to the job description (${MIN_JD_WORDS - jdWordCount} more words needed)`
                    : jdWordCount > MAX_JD_WORDS
                      ? `Job description is too long (${jdWordCount - MAX_JD_WORDS} words over limit)`
                      : ""}
          </p>
        )}
      </div>

      {matchResult && (
        <div ref={resultsRef} className="mt-10 border-t pt-10">
          <DashboardMatchResults
            score={{
              overall: matchResult.overallScore.overall,
              dimensions: matchResult.overallScore.dimensions,
              summary: matchResult.overallScore.summary,
            }}
            skillsBreakdown={matchResult.skillsBreakdown}
            actionItems={matchResult.actionItems}
            topStrengths={matchResult.topStrengths}
            atsKeywords={matchResult.atsKeywords}
            experienceAlignment={matchResult.experienceAlignment}
            qualificationFit={matchResult.qualificationFit}
            userType={userType}
            tier={tier}
          />
        </div>
      )}
    </div>
  );
}
