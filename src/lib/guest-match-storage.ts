import type { ParsedResume } from "@/lib/validations/parsed-resume";
import type {
  OverallScoreData,
  SkillsBreakdownData,
  ActionItemsData,
  TopStrengthsData,
  ATSKeywordsData,
  ExperienceAlignmentData,
} from "@/services/insights/types";

const STORAGE_KEY = "guest_match_result";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface GuestMatchData {
  resumeFileName: string;
  resumeFileType: string;
  resumeFileSize: number;
  resumeParsedData: ParsedResume;
  jobDescriptionText: string;
  insights: {
    overallScore: OverallScoreData;
    skillsBreakdown: SkillsBreakdownData;
    actionItems: ActionItemsData;
    topStrengths: TopStrengthsData;
    atsKeywords: ATSKeywordsData;
    experienceAlignment: ExperienceAlignmentData;
  };
  createdAt: string;
}

export function saveGuestMatch(data: Omit<GuestMatchData, "createdAt">) {
  try {
    const payload: GuestMatchData = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function getGuestMatch(): GuestMatchData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: GuestMatchData = JSON.parse(raw);

    const age = Date.now() - new Date(data.createdAt).getTime();
    if (age > EXPIRY_MS) {
      clearGuestMatch();
      return null;
    }

    return data;
  } catch {
    clearGuestMatch();
    return null;
  }
}

export function clearGuestMatch() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
