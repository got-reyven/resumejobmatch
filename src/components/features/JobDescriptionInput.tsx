"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Link2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Loader2,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type InputMode = "text" | "url";
type ExtractStatus = "idle" | "extracting" | "done" | "error";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSourceUrlChange?: (url: string | null) => void;
}

const MIN_WORDS = 30;
const MAX_WORDS = 800;

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function JobDescriptionInput({
  value,
  onChange,
  onSourceUrlChange,
}: JobDescriptionInputProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(560);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = countWords(value);
  const isBelowMin = wordCount > 0 && wordCount < MIN_WORDS;
  const isOverMax = wordCount > MAX_WORDS;

  const [urlInput, setUrlInput] = useState("");
  const [extractStatus, setExtractStatus] = useState<ExtractStatus>("idle");
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractedMeta, setExtractedMeta] = useState<{
    title: string | null;
    company: string | null;
    location: string | null;
  } | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    setHasOverflow(el.scrollHeight > el.clientHeight + 4);
    if (expanded) {
      setExpandedHeight(Math.max(560, el.scrollHeight + 2));
    }
  }, [value, expanded]);

  async function handleExtract() {
    if (!isValidUrl(urlInput)) {
      setExtractError(
        "Please enter a valid URL starting with http:// or https://"
      );
      return;
    }

    setExtractStatus("extracting");
    setExtractError(null);
    setExtractedMeta(null);

    try {
      const response = await fetch("/api/v1/jobs/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const json = await response.json();

      if (!response.ok) {
        setExtractError(
          json.error?.message ?? "Failed to extract job description."
        );
        setExtractStatus("error");
        return;
      }

      const { jobDescription, title, company, location } = json.data;
      onChange(jobDescription);
      onSourceUrlChange?.(urlInput);
      setExtractedMeta({ title, company, location });
      setExtractStatus("done");
      setMode("text");
    } catch {
      setExtractError(
        "Network error. Please check your connection and try again."
      );
      setExtractStatus("error");
    }
  }

  function handleModeSwitch(newMode: InputMode) {
    setMode(newMode);
    if (newMode === "url") {
      setExtractStatus("idle");
      setExtractError(null);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => handleModeSwitch("text")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
            mode === "text"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Paste job description text"
        >
          <FileText className="h-4 w-4" />
          Paste Text
        </button>
        <button
          onClick={() => handleModeSwitch("url")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
            mode === "url"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Paste job listing URL"
        >
          <Link2 className="h-4 w-4" />
          Paste URL
        </button>
      </div>

      {extractedMeta && mode === "text" && extractStatus === "done" && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div className="min-w-0 text-xs">
            <span className="font-medium text-green-800">
              Extracted from URL
            </span>
            {(extractedMeta.title || extractedMeta.company) && (
              <p className="mt-0.5 truncate text-green-700">
                {[
                  extractedMeta.title,
                  extractedMeta.company,
                  extractedMeta.location,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}

      {mode === "text" ? (
        <div className="relative flex flex-1 flex-col">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Paste the full job description here..."
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                if (extractStatus === "done") {
                  setExtractStatus("idle");
                  setExtractedMeta(null);
                  onSourceUrlChange?.(null);
                }
              }}
              className={cn(
                "w-full resize-none text-sm leading-relaxed [field-sizing:fixed]",
                expanded ? "max-h-none" : "h-[560px] overflow-y-auto"
              )}
              style={expanded ? { height: `${expandedHeight}px` } : undefined}
              aria-label="Job description text"
            />
            {!expanded && hasOverflow && (
              <div
                className="pointer-events-none absolute inset-x-px bottom-px h-16 rounded-b-md bg-gradient-to-t from-background/90 to-transparent"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={
                    expanded ? "Minimize textarea" : "Expand textarea"
                  }
                >
                  {expanded ? (
                    <Minimize2 className="h-3 w-3" />
                  ) : (
                    <Maximize2 className="h-3 w-3" />
                  )}
                  {expanded ? "Minimize" : "Expand"}
                </button>
              )}
              <span
                className={cn(
                  isBelowMin && "text-destructive",
                  isOverMax && "text-destructive",
                  wordCount >= MIN_WORDS && !isOverMax && "text-primary"
                )}
              >
                {wordCount} / {MAX_WORDS} words
              </span>
            </div>
            {isBelowMin && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                Need {MIN_WORDS - wordCount} more words
              </span>
            )}
            {isOverMax && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                {wordCount - MAX_WORDS} words over limit
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            {extractStatus === "extracting" ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            ) : (
              <Globe className="h-7 w-7 text-muted-foreground" />
            )}
          </div>

          <div className="w-full max-w-md space-y-3">
            <Input
              type="url"
              placeholder="https://linkedin.com/jobs/view/..."
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (extractError) setExtractError(null);
              }}
              disabled={extractStatus === "extracting"}
              className="text-center"
              aria-label="Job listing URL"
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValidUrl(urlInput)) {
                  e.preventDefault();
                  handleExtract();
                }
              }}
            />

            <Button
              onClick={handleExtract}
              disabled={!urlInput.trim() || extractStatus === "extracting"}
              className="w-full"
              size="lg"
            >
              {extractStatus === "extracting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting job details...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Extract Job Description
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Paste a public job listing URL — we&apos;ll extract the
              description automatically using AI
            </p>
          </div>

          {extractError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{extractError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
