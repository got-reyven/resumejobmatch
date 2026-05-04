/**
 * Generates a compact summary string for a given insight, suitable
 * for the comparison matrix cells.
 */
export function getInsightSummary(
  insightId: string,
  data: Record<string, unknown>
): string {
  switch (insightId) {
    case "overallScore": {
      const score = (data as { overall?: number }).overall;
      return score != null ? `${score}%` : "—";
    }

    case "skillsBreakdown": {
      const pct = (data as { coverage_percent?: number }).coverage_percent;
      return pct != null ? `${pct}% coverage` : "—";
    }

    case "experienceAlignment": {
      const fit = (data as { seniority_fit?: string }).seniority_fit;
      const years = (data as { total_relevant_years?: number })
        .total_relevant_years;
      const parts: string[] = [];
      if (years != null) parts.push(`${years}y`);
      if (fit) parts.push(fit);
      return parts.length ? parts.join(" · ") : "—";
    }

    case "qualificationFit": {
      const quals = (data as { qualifications?: { status: string }[] })
        .qualifications;
      if (!quals?.length) return "—";
      const met = quals.filter((q) => q.status === "met").length;
      return `${met}/${quals.length} met`;
    }

    case "softSkills": {
      const pct = (data as { coverage_percent?: number }).coverage_percent;
      return pct != null ? `${pct}% coverage` : "—";
    }

    case "careerGap": {
      const gaps = (data as { gaps?: unknown[] }).gaps;
      const hasSig = (data as { has_significant_gaps?: boolean })
        .has_significant_gaps;
      if (!gaps?.length) return "No gaps";
      return hasSig ? `${gaps.length} gap(s)` : `${gaps.length} minor`;
    }

    case "actionItems": {
      const actions = (data as { actions?: unknown[] }).actions;
      return actions?.length ? `${actions.length} actions` : "—";
    }

    case "atsKeywords": {
      const likelihood = (data as { ats_pass_likelihood?: string })
        .ats_pass_likelihood;
      return likelihood ? `Pass: ${likelihood}` : "—";
    }

    case "sectionStrength": {
      const weakest = (data as { weakest?: string }).weakest;
      return weakest ? `Weakest: ${weakest}` : "—";
    }

    case "tailoredSummary":
      return "Generated";

    case "rewriteSuggestions": {
      const rewrites = (data as { rewrites?: unknown[] }).rewrites;
      return rewrites?.length ? `${rewrites.length} suggestion(s)` : "—";
    }

    case "competitivePositioning": {
      const positioning = (data as { positioning?: string }).positioning;
      return positioning ?? "—";
    }

    case "industryJargon": {
      const terms = (data as { terms?: { present: boolean }[] }).terms;
      if (!terms?.length) return "—";
      const found = terms.filter((t) => t.present).length;
      return `${found}/${terms.length} terms`;
    }

    case "coverLetter":
      return "Generated";

    case "topStrengths": {
      const strengths = (data as { strengths?: unknown[] }).strengths;
      return strengths?.length ? `${strengths.length} strengths` : "—";
    }

    case "riskAreas": {
      const risks = (data as { risks?: { severity: string }[] }).risks;
      if (!risks?.length) return "No risks";
      const critical = risks.filter((r) => r.severity === "critical").length;
      return critical
        ? `${risks.length} (${critical} critical)`
        : `${risks.length} risk(s)`;
    }

    case "interviewFocus": {
      const questions = (data as { questions?: unknown[] }).questions;
      return questions?.length ? `${questions.length} questions` : "—";
    }

    case "overqualification": {
      const isOver = (data as { is_overqualified?: boolean }).is_overqualified;
      const confidence = (data as { confidence?: string }).confidence;
      if (isOver == null) return "—";
      return isOver ? `Yes (${confidence})` : "No";
    }

    case "resumeIntegrity": {
      const level = (data as { risk_level?: string }).risk_level;
      return level ? `Risk: ${level}` : "—";
    }

    case "skillTransferability": {
      const transfers = (data as { transfers?: unknown[] }).transfers;
      return transfers?.length ? `${transfers.length} transfers` : "—";
    }

    case "cultureCommunication": {
      const style = (data as { communication_style?: string })
        .communication_style;
      return style ? truncate(style, 40) : "—";
    }

    case "salaryRange": {
      const range = (
        data as { range?: { low: number; high: number; currency: string } }
      ).range;
      if (!range) return "—";
      const fmt = (n: number) =>
        n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
      return `${range.currency} ${fmt(range.low)}–${fmt(range.high)}`;
    }

    default:
      return "Available";
  }
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
