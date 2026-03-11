"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/features/ResumeUpload";
import { JobDescriptionInput } from "@/components/features/JobDescriptionInput";
import { DashboardMatchResults } from "@/components/features/DashboardMatchResults";
import { useProfile } from "@/components/features/ProfileContext";
import type { ParsedResume } from "@/lib/validations/parsed-resume";
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

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
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
  } | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { userType, tier } = useProfile();

  const jdWordCount = countWords(jobDescription);
  const isReady =
    parsedResume !== null &&
    jdWordCount >= MIN_JD_WORDS &&
    jdWordCount <= MAX_JD_WORDS;

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    setFile(selectedFile);
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
    if (!isReady || !parsedResume || !file) return;

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
      };

      setMatchResult(resultData);
      setMatchStatus("matched");

      fetch("/api/v1/matches/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeFileName: file.name,
          resumeFileType: file.type,
          resumeFileSize: file.size,
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
  }, [isReady, parsedResume, jobDescription, file]);

  const handleReset = () => {
    setFile(null);
    setParsedResume(null);
    setParseStatus("idle");
    setParseError(null);
    setJobDescription("");
    setMatchStatus("idle");
    setMatchError(null);
    setMatchResult(null);
  };

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
          <Button variant="outline" size="sm" onClick={handleReset}>
            Start Over
          </Button>
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
              : !file && !jobDescription
                ? "Upload your resume and paste a job description to begin"
                : !parsedResume
                  ? "Upload your resume to continue"
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
            userType={userType}
            tier={tier}
          />
        </div>
      )}
    </div>
  );
}
