import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/api-error-handler";
import {
  AuthenticationError,
  NotFoundError,
  AppError,
} from "@/lib/errors/app-error";
import { INSIGHT_META } from "@/services/match-persistence";
import { computeOverallScore } from "@/services/insights/overall-score/compute";
import { computeSkillsBreakdown } from "@/services/insights/skills-breakdown/compute";
import { computeActionItems } from "@/services/insights/action-items/compute";
import { computeTopStrengths } from "@/services/insights/top-strengths/compute";
import { computeATSKeywords } from "@/services/insights/ats-keywords/compute";
import { computeExperienceAlignment } from "@/services/insights/experience-alignment/compute";
import { computeQualificationFit } from "@/services/insights/qualification-fit/compute";
import { computeSectionStrength } from "@/services/insights/section-strength/compute";
import { computeTailoredSummary } from "@/services/insights/tailored-summary/compute";
import { computeRiskAreas } from "@/services/insights/risk-areas/compute";
import type { InsightComputeContext } from "@/services/insights/types";
import type { ParsedResume } from "@/lib/validations/parsed-resume";

const computeMap: Record<
  string,
  (ctx: InsightComputeContext) => Promise<{ data: unknown }>
> = {
  overallScore: async (ctx) => {
    const r = await computeOverallScore(ctx);
    return { data: r.data };
  },
  skillsBreakdown: async (ctx) => {
    const r = await computeSkillsBreakdown(ctx);
    return { data: r.data };
  },
  actionItems: async (ctx) => {
    const r = await computeActionItems(ctx);
    return { data: r.data };
  },
  topStrengths: async (ctx) => {
    const r = await computeTopStrengths(ctx);
    return { data: r.data };
  },
  atsKeywords: async (ctx) => {
    const r = await computeATSKeywords(ctx);
    return { data: r.data };
  },
  experienceAlignment: async (ctx) => {
    const r = await computeExperienceAlignment(ctx);
    return { data: r.data };
  },
  qualificationFit: async (ctx) => {
    const r = await computeQualificationFit(ctx);
    return { data: r.data };
  },
  sectionStrength: async (ctx) => {
    const r = await computeSectionStrength(ctx);
    return { data: r.data };
  },
  tailoredSummary: async (ctx) => {
    const r = await computeTailoredSummary(ctx);
    return { data: r.data };
  },
  riskAreas: async (ctx) => {
    const r = await computeRiskAreas(ctx);
    return { data: r.data };
  },
};

const bodySchema = z.object({
  insightId: z.string(),
});

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/v1/matches/[id]/insights
// Computes a single insight for an existing saved match and persists it
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AuthenticationError();

    const { id } = await context.params;
    const body = await request.json();
    const { insightId } = bodySchema.parse(body);

    const computeFn = computeMap[insightId];
    if (!computeFn) {
      throw new AppError(
        `Unknown insight: ${insightId}`,
        "VALIDATION_ERROR",
        400
      );
    }

    const meta = INSIGHT_META[insightId];
    if (!meta) {
      throw new AppError(
        `No metadata for insight: ${insightId}`,
        "VALIDATION_ERROR",
        400
      );
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(
        `
        id,
        resumes ( parsed_data ),
        job_descriptions ( raw_text )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (matchError || !match) throw new NotFoundError("Match");

    const resume = Array.isArray(match.resumes)
      ? match.resumes[0]
      : match.resumes;
    const job = Array.isArray(match.job_descriptions)
      ? match.job_descriptions[0]
      : match.job_descriptions;

    if (!resume?.parsed_data || !job?.raw_text) {
      throw new AppError(
        "Match is missing resume or job description data",
        "VALIDATION_ERROR",
        400
      );
    }

    const ctx: InsightComputeContext = {
      resume: resume.parsed_data as unknown as ParsedResume,
      jobDescription: job.raw_text,
    };

    const result = await computeFn(ctx);

    await supabase.from("match_insights").insert({
      match_id: id,
      insight_key: insightId,
      tab: meta.tab,
      tier: meta.tier,
      title: meta.title,
      data: result.data,
    });

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
