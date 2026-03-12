"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Rocket, Lock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/features/Header";
import { ResumeUpload } from "@/components/features/ResumeUpload";
import { JobDescriptionInput } from "@/components/features/JobDescriptionInput";
import { MatchResults } from "@/components/features/MatchResults";
import { saveGuestMatch } from "@/lib/guest-match-storage";
import { createClient } from "@/lib/supabase/client";
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

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function MatchingHero() {
  const [totalMatches, setTotalMatches] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedMatchId, setSavedMatchId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.totalMatches > 0)
          setTotalMatches(json.data.totalMatches);
      })
      .catch(() => {});

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setIsLoggedIn(true);
    });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseStatus>("idle");
  const [parseError, setParseError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [savedResumeInfo, setSavedResumeInfo] = useState<{
    fileName: string;
    fileSize: number;
  } | null>(null);

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
  const [matchedJdSnapshot, setMatchedJdSnapshot] = useState<string | null>(
    null
  );
  const resultsRef = useRef<HTMLDivElement>(null);

  const hasMatchedOnce = matchResult !== null;
  const jdModifiedAfterMatch =
    hasMatchedOnce && jobDescription !== matchedJdSnapshot;

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

      const insights = {
        overallScore: json.data.overallScore.data,
        skillsBreakdown: json.data.skillsBreakdown.data,
        actionItems: json.data.actionItems.data,
        topStrengths: json.data.topStrengths.data,
        atsKeywords: json.data.atsKeywords.data,
        experienceAlignment: json.data.experienceAlignment.data,
      };

      setMatchResult(insights);
      setMatchedJdSnapshot(jobDescription);
      setMatchStatus("matched");

      const resumeFileName =
        file?.name ?? savedResumeInfo?.fileName ?? "resume.pdf";
      const resumeFileType = file?.type ?? "application/pdf";
      const resumeFileSize = file?.size ?? savedResumeInfo?.fileSize ?? 0;

      if (parsedResume && (file || savedResumeInfo)) {
        if (isLoggedIn) {
          fetch("/api/v1/matches/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeFileName,
              resumeFileType,
              resumeFileSize,
              resumeParsedData: parsedResume,
              jobDescriptionText: jobDescription,
              insights,
            }),
          })
            .then((r) => r.json())
            .then((json) => {
              if (json.data?.matchId) setSavedMatchId(json.data.matchId);
            })
            .catch((err) => console.error("Failed to save match:", err));
        } else {
          saveGuestMatch({
            resumeFileName,
            resumeFileType,
            resumeFileSize,
            resumeParsedData: parsedResume,
            jobDescriptionText: jobDescription,
            insights,
          });
        }
      }

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
  }, [
    isReady,
    parsedResume,
    jobDescription,
    file,
    savedResumeInfo,
    isLoggedIn,
  ]);

  return (
    <>
      <div className="mx-auto w-[98%] pt-4 sm:pt-5">
        <div className="hero-box overflow-hidden rounded-3xl">
          <Header />
          <section
            id="hero"
            className="px-6 pb-16 pt-12 sm:px-10 sm:pb-20 sm:pt-16 lg:px-16 lg:pb-24 lg:pt-20"
          >
            <div className="mx-auto max-w-3xl text-center">
              {totalMatches !== null && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 shadow-sm">
                  <TrendingUp
                    className="h-4 w-4 text-white"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-white">
                    <span className="font-bold">
                      {formatCount(totalMatches)}
                    </span>{" "}
                    resumes matched!
                  </span>
                </div>
              )}

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                See how well you match
                <span className="block text-white/90"> — in seconds</span>
              </h1>
              <p className="mt-4 text-lg text-white/70 sm:text-xl">
                Paste a job description + upload your resume. <br />
                Get instant, actionable insights.
              </p>
            </div>

            <div className="mx-auto mt-12 w-full max-w-6xl">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex min-h-[600px] flex-col">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                      1
                    </span>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                      Your Resume
                    </h2>
                  </div>
                  <div className="flex-1 rounded-xl bg-white p-4 shadow-xl">
                    <ResumeUpload
                      file={file}
                      onFileSelect={handleFileSelect}
                      onParsed={setParsedResume}
                      parsedResume={parsedResume}
                      parseStatus={parseStatus}
                      parseError={parseError}
                      isLoggedIn={isLoggedIn}
                      onSavedResumeSelect={handleSavedResumeSelect}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                      2
                    </span>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                      Job Description
                    </h2>
                  </div>
                  <div className="flex-1 rounded-xl bg-white p-4 shadow-xl">
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
                  className="h-14 rounded-full bg-white px-10 text-base font-semibold text-slate-900 shadow-lg transition-all hover:bg-white/90 hover:shadow-xl disabled:opacity-50"
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
                      Click to Start Matching
                    </>
                  )}
                </Button>

                {hasMatchedOnce && !matchStatus.startsWith("match") && (
                  <p className="text-center text-sm text-white/70">
                    Register or log in to run additional matches.
                  </p>
                )}

                {jdModifiedAfterMatch && (
                  <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2.5 text-sm text-white backdrop-blur-sm">
                    <Lock className="h-4 w-4 shrink-0" />
                    You cannot re-run the matching with the changes, please
                    register or login.
                  </div>
                )}

                {matchStatus === "matching" && (
                  <p className="text-sm text-black/70">
                    Reading resume &rarr; Analyzing job &rarr; Matching skills
                    &rarr; Generating insights&hellip;
                  </p>
                )}

                {matchStatus === "error" && (
                  <p className="text-sm text-red-200">{matchError}</p>
                )}

                {!hasMatchedOnce && matchStatus === "idle" && !isReady && (
                  <p className="text-sm text-white/70">
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
          </section>
        </div>
      </div>

      {matchResult && (
        <div className="mx-auto mt-4 w-[98%] sm:mt-5">
          <div
            ref={resultsRef}
            className="rounded-3xl px-6 py-12 sm:px-10 sm:py-16 lg:px-16"
            style={{ backgroundColor: "#F5F5F5" }}
          >
            <MatchResults
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
              isLoggedIn={isLoggedIn}
              savedMatchId={savedMatchId}
            />
          </div>
        </div>
      )}
    </>
  );
}
