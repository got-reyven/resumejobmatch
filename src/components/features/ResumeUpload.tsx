"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FILE_LIMITS } from "@/lib/constants/app";
import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { Badge } from "@/components/ui/badge";

type ParseStatus = "idle" | "parsing" | "parsed" | "error";

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void;
  onParsed: (parsed: ParsedResume | null) => void;
  file: File | null;
  parsedResume: ParsedResume | null;
  parseStatus: ParseStatus;
  parseError: string | null;
}

function getFileExtension(name: string) {
  return name.slice(name.lastIndexOf(".")).toLowerCase();
}

function isAcceptedType(file: File): boolean {
  const ext = getFileExtension(file.name);
  return (
    FILE_LIMITS.acceptedTypes.includes(ext as ".pdf" | ".docx") ||
    FILE_LIMITS.acceptedMimeTypes.includes(
      file.type as (typeof FILE_LIMITS.acceptedMimeTypes)[number]
    )
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeUpload({
  onFileSelect,
  onParsed,
  file,
  parsedResume,
  parseStatus,
  parseError,
}: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = useCallback(
    (selectedFile: File) => {
      setValidationError(null);

      if (!isAcceptedType(selectedFile)) {
        setValidationError("Only PDF and DOCX files are accepted.");
        return;
      }

      if (selectedFile.size > FILE_LIMITS.maxSizeBytes) {
        setValidationError(
          `File too large. Max size is ${formatFileSize(FILE_LIMITS.maxSizeBytes)}.`
        );
        return;
      }

      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) validateAndSet(droppedFile);
    },
    [validateAndSet]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) validateAndSet(selected);
    },
    [validateAndSet]
  );

  const handleRemove = useCallback(() => {
    setValidationError(null);
    onFileSelect(null);
    onParsed(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileSelect, onParsed]);

  const displayError = validationError ?? parseError;

  if (file && (parseStatus === "parsing" || parseStatus === "parsed")) {
    return (
      <div
        className={cn(
          "flex h-full flex-col rounded-xl border-2 border-dashed p-6",
          parseStatus === "parsed"
            ? "border-green-400 bg-background"
            : "border-primary/30 bg-primary/5"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {parseStatus === "parsing" ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Remove uploaded file"
            disabled={parseStatus === "parsing"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {parseStatus === "parsing" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <p>Reading and parsing your resume...</p>
            <p className="text-xs">This usually takes 5-10 seconds</p>
          </div>
        )}

        {parseStatus === "parsed" && parsedResume && (
          <ParsedResumePreview data={parsedResume} />
        )}
      </div>
    );
  }

  if (file && parseStatus === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-destructive/30 bg-destructive/5 p-8">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="text-center">
          <p className="font-medium text-destructive">Parsing failed</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {parseError ?? "Something went wrong. Please try again."}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
          Remove and try again
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload resume file"
      className={cn(
        "flex h-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all",
        isDragOver
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        displayError && "border-destructive/50"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
          isDragOver ? "bg-primary/10" : "bg-muted"
        )}
      >
        {isDragOver ? (
          <FileText className="h-7 w-7 text-primary" />
        ) : (
          <Upload className="h-7 w-7 text-muted-foreground" />
        )}
      </div>

      <div className="text-center">
        <p className="font-medium">
          {isDragOver ? "Drop your resume here" : "Drag & drop your resume"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or click to browse &middot; PDF, DOCX &middot; Max 5MB
        </p>
      </div>

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}

function ParsedResumePreview({ data }: { data: ParsedResume }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto text-sm">
      <div>
        <p className="font-semibold">{data.name}</p>
        {data.email && (
          <p className="text-xs text-muted-foreground">{data.email}</p>
        )}
        {data.location && (
          <p className="text-xs text-muted-foreground">{data.location}</p>
        )}
      </div>

      {data.skills.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {data.experience.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Experience
            {data.total_years_experience != null &&
              ` (${data.total_years_experience}+ yrs)`}
          </p>
          <ul className="space-y-1">
            {data.experience.map((exp, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{exp.title}</span>{" "}
                at {exp.company}
                {exp.start_date && (
                  <span>
                    {" "}
                    &middot; {exp.start_date}
                    {exp.end_date ? ` – ${exp.end_date}` : " – Present"}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.education.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Education
          </p>
          <ul className="space-y-0.5">
            {data.education.map((edu, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {edu.degree}
                </span>
                {edu.field_of_study && ` in ${edu.field_of_study}`} —{" "}
                {edu.institution}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
