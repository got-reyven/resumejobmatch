export const APP_NAME = "Resume Job Match";
export const APP_DESCRIPTION = "Know exactly how you match — before you apply.";
export const APP_URL = "https://resumejobmatch.com";

export const RATE_LIMITS = {
  guest: { dailyMatches: 3 },
  jobseeker: {
    free: { dailyMatches: 10 },
    pro: { dailyMatches: Infinity },
  },
  business: {
    free: { dailyMatches: 10 },
    pro: { dailyMatches: Infinity },
  },
  abuseCap: { dailyMatches: 1000 },
} as const;

export const FILE_LIMITS = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  acceptedTypes: [".pdf", ".docx"] as const,
  acceptedMimeTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;
