"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Clock,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FILE_LIMITS } from "@/lib/constants/app";
import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { Badge } from "@/components/ui/badge";

type ParseStatus = "idle" | "parsing" | "parsed" | "error";

interface SavedResume {
  id: string;
  fileName: string;
  fileSize: number;
  parsedData: ParsedResume;
  createdAt: string;
}

interface ResumeUploadProps {
  onFileSelect: (file: File | null) => void;
  onParsed: (parsed: ParsedResume | null) => void;
  file: File | null;
  parsedResume: ParsedResume | null;
  parseStatus: ParseStatus;
  parseError: string | null;
  isLoggedIn?: boolean;
  onSavedResumeSelect?: (resume: SavedResume) => void;
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ResumeUpload({
  onFileSelect,
  onParsed,
  file,
  parsedResume,
  parseStatus,
  parseError,
  isLoggedIn = false,
  onSavedResumeSelect,
}: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedList, setShowSavedList] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(isLoggedIn);
  const [selectedSavedResume, setSelectedSavedResume] =
    useState<SavedResume | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    fetch("/api/v1/resumes/saved")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.data) setSavedResumes(json.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingSaved(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSavedList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredResumes = savedResumes.filter(
    (r) =>
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.parsedData.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSaved = useCallback(
    (resume: SavedResume) => {
      setSelectedSavedResume(resume);
      setShowSavedList(false);
      setSearchQuery("");
      onParsed(resume.parsedData);
      onSavedResumeSelect?.(resume);
    },
    [onParsed, onSavedResumeSelect]
  );

  const handleClearSaved = useCallback(() => {
    setSelectedSavedResume(null);
    onParsed(null);
    onFileSelect(null);
  }, [onParsed, onFileSelect]);

  const validateAndSet = useCallback(
    (selectedFile: File) => {
      setValidationError(null);
      setSelectedSavedResume(null);

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
    setSelectedSavedResume(null);
    onFileSelect(null);
    onParsed(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileSelect, onParsed]);

  const displayError = validationError ?? parseError;

  if (selectedSavedResume) {
    return (
      <div className="flex h-full flex-col rounded-xl border-2 border-dashed border-green-400 bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">
                {selectedSavedResume.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedSavedResume.fileSize)} &middot; Saved
                resume
              </p>
            </div>
          </div>
          <button
            onClick={handleClearSaved}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Remove selected resume"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ParsedResumePreview data={selectedSavedResume.parsedData} />
      </div>
    );
  }

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
    <div className="flex h-full flex-col gap-3">
      {isLoggedIn && savedResumes.length > 0 && (
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search saved resumes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSavedList(true);
              }}
              onFocus={() => setShowSavedList(true)}
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {showSavedList && (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border bg-background shadow-lg">
              {loadingSaved ? (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : filteredResumes.length === 0 ? (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? "No matching resumes found"
                    : "No saved resumes"}
                </div>
              ) : (
                filteredResumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => handleSelectSaved(resume)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {resume.parsedData.name || resume.fileName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {resume.fileName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(resume.createdAt)}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

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
          "flex flex-1 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all",
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
    </div>
  );
}

function ParsedResumePreview({ data }: { data: ParsedResume }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto text-sm">
      <div>
        <p className="font-semibold">{data.name}</p>
        {(data.email || data.phone || data.location) && (
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {data.email && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                {data.email}
              </span>
            )}
            {data.phone && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" />
                {data.phone}
              </span>
            )}
            {data.location && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                {data.location}
              </span>
            )}
          </div>
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

      {data.key_responsibilities.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Key Responsibilities
          </p>
          <ul className="space-y-0.5">
            {data.key_responsibilities.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs text-muted-foreground"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                {item}
              </li>
            ))}
          </ul>
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
                {(edu.start_year || edu.end_year) && (
                  <span>
                    {" "}
                    &middot;{" "}
                    {edu.start_year && edu.end_year
                      ? `${edu.start_year}–${edu.end_year}`
                      : (edu.end_year ?? edu.start_year)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
