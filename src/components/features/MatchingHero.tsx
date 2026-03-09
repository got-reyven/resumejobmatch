"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Rocket, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/features/ResumeUpload";
import { JobDescriptionInput } from "@/components/features/JobDescriptionInput";
import { MatchResults } from "@/components/features/MatchResults";
import type { ParsedResume } from "@/lib/validations/parsed-resume";
import type {
  OverallScoreData,
  SkillsBreakdownData,
  ActionItemsData,
  TopStrengthsData,
} from "@/services/insights/types";

type ParseStatus = "idle" | "parsing" | "parsed" | "error";
type MatchStatus = "idle" | "matching" | "matched" | "error";
const MIN_JD_WORDS = 30;
const MAX_JD_WORDS = 800;

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function MatchingHero() {
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
  } | null>(null);
  const [matchedJdSnapshot, setMatchedJdSnapshot] = useState<string | null>(
    null
  );
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasMatchedOnce = matchResult !== null;
  const jdModifiedAfterMatch =
    hasMatchedOnce && jobDescription !== matchedJdSnapshot;

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
    if (!isReady || !parsedResume) return;

    setMatchStatus("matching");
    setMatchError(null);
    setMatchResult(null);

    try {
      const response = await fetch("/api/v1/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: parsedResume,
          jobDescription,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        setMatchError(
          json.error?.message ?? "Matching failed. Please try again."
        );
        setMatchStatus("error");
        return;
      }

      setMatchResult({
        overallScore: json.data.overallScore.data,
        skillsBreakdown: json.data.skillsBreakdown.data,
        actionItems: json.data.actionItems.data,
        topStrengths: json.data.topStrengths.data,
      });
      setMatchedJdSnapshot(jobDescription);
      setMatchStatus("matched");

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
  }, [isReady, parsedResume, jobDescription]);

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100vh-4rem)] flex-col"
    >
      <div className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <div className="flex flex-1 flex-col rounded-2xl bg-background/100 p-6 backdrop-blur-sm sm:p-10 lg:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              See how well you match
              <span className="block text-primary"> — in seconds</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              Paste a job description + upload your resume. <br />
              Get instant, actionable insights.
            </p>
          </div>

          <div className="mt-10 w-full">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex min-h-[600px] flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    1
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Your Resume
                  </h2>
                </div>
                <div className="flex-1">
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
                disabled={
                  !isReady || matchStatus === "matching" || hasMatchedOnce
                }
                onClick={handleStartMatching}
                className="h-14 px-10 text-base font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {matchStatus === "matching" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : hasMatchedOnce ? (
                  <>
                    <Lock className="h-5 w-5" />
                    Match Again
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    Start Matching
                  </>
                )}
              </Button>

              {hasMatchedOnce && !matchStatus.startsWith("match") && (
                <p className="text-center text-sm text-muted-foreground">
                  Register or log in to run additional matches.
                </p>
              )}

              {jdModifiedAfterMatch && (
                <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2.5 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                  <Lock className="h-4 w-4 shrink-0" />
                  You cannot re-run the matching with the changes, please
                  register or login.
                </div>
              )}

              {matchStatus === "matching" && (
                <p className="text-sm text-muted-foreground">
                  Reading resume &rarr; Analyzing job &rarr; Matching skills
                  &rarr; Generating insights&hellip;
                </p>
              )}

              {matchStatus === "error" && (
                <p className="text-sm text-destructive">{matchError}</p>
              )}

              {!hasMatchedOnce && matchStatus === "idle" && !isReady && (
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
          </div>

          {matchResult && (
            <div ref={resultsRef} className="mt-10 border-t pt-10">
              <MatchResults
                score={{
                  overall: matchResult.overallScore.overall,
                  dimensions: matchResult.overallScore.dimensions,
                  summary: matchResult.overallScore.summary,
                }}
                skillsBreakdown={matchResult.skillsBreakdown}
                actionItems={matchResult.actionItems}
                topStrengths={matchResult.topStrengths}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
