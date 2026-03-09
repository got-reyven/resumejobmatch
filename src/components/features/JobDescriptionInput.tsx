"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Link2,
  AlertCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type InputMode = "text" | "url";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MIN_WORDS = 30;
const MAX_WORDS = 800;

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState(560);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = countWords(value);
  const isBelowMin = wordCount > 0 && wordCount < MIN_WORDS;
  const isOverMax = wordCount > MAX_WORDS;

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    setHasOverflow(el.scrollHeight > el.clientHeight + 4);
    if (expanded) {
      setExpandedHeight(Math.max(560, el.scrollHeight + 2));
    }
  }, [value, expanded]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setMode("text")}
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
          onClick={() => setMode("url")}
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

      {mode === "text" ? (
        <div className="relative flex flex-1 flex-col">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Paste the full job description here..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
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
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Link2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="w-full max-w-md space-y-2">
            <Input
              type="url"
              placeholder="https://linkedin.com/jobs/view/..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="text-center"
              aria-label="Job listing URL"
            />
            <p className="text-center text-xs text-muted-foreground">
              Paste a public job listing URL — we&apos;ll extract the
              description
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
