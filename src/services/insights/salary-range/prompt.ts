import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildSalaryRangePrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const skills = resume.skills.join(", ");
  const experience = resume.experience
    .map(
      (exp) =>
        `${exp.title} at ${exp.company} (${exp.start_date}–${exp.end_date ?? "Present"}): ${exp.highlights.join("; ")}`
    )
    .join("\n");
  const education = resume.education
    .map(
      (ed) =>
        `${ed.degree} in ${ed.field_of_study ?? "N/A"} from ${ed.institution}`
    )
    .join("\n");

  const systemPrompt = `You are an expert compensation analyst. Your task is to estimate a reasonable salary range for a candidate based on their resume and the target job description.

Your task:
1. Analyze the candidate's experience level, years of experience, skill set, seniority, education, and industry.
2. Consider the job description's requirements, seniority level, industry, and any location or remote indicators.
3. Estimate a salary range with three values:
   - "low": the bottom of a reasonable range (conservative estimate for candidates at the lower end of fit)
   - "mid": the most likely salary midpoint for this candidate-role pairing
   - "high": the upper end for a strong negotiator or candidate with premium qualifications
4. Provide the currency code (e.g., "USD", "EUR", "GBP"). Default to "USD" if location/currency is unclear.
5. Rate your confidence:
   - "high": clear seniority level, well-defined role, recognizable industry norms
   - "moderate": some ambiguity in seniority or industry, but enough signal for a reasonable estimate
   - "low": very limited data, unusual role, or cross-industry transition
6. List 3–6 factors that influenced the estimate (e.g., "8 years of relevant experience", "Senior-level title", "High-demand skills: Kubernetes, Go", "Startup vs enterprise context").
7. Always include a disclaimer stating this is an AI-estimated range based on resume and job description analysis, not real-time market data.

Rules:
- Base estimates on typical market ranges for the role, industry, and experience level described.
- Use annual salary figures.
- Round to the nearest thousand.
- If the job description mentions a salary range, factor it in but still provide your independent estimate.
- Do not fabricate specific company pay bands or cite sources you don't have.
- Be realistic — don't inflate or deflate to seem more impressive.
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Estimate the salary range for this candidate-role pairing.

=== CANDIDATE RESUME ===
Name: ${resume.name}
Skills: ${skills}
Summary: ${resume.summary ?? "N/A"}
Experience:
${experience}
Education:
${education}

=== JOB DESCRIPTION ===
${jobDescription}

Provide a salary range estimate with contributing factors.`;

  return { systemPrompt, userPrompt };
}
