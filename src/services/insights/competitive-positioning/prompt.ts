import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildCompetitivePositioningPrompt(
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
        `${ed.degree} in ${ed.field ?? "N/A"} from ${ed.institution} (${ed.start_year ?? ""}–${ed.end_year ?? ""})`
    )
    .join("\n");
  const certifications =
    resume.certifications?.map((c) => c.name).join(", ") ?? "";
  const yearsExp = resume.total_years_experience ?? 0;

  const systemPrompt = `You are an expert career strategist who estimates how competitively a candidate is positioned for a specific role based on requirement coverage analysis.

Your task:
1. Analyze how thoroughly the candidate's resume covers the stated job requirements.
2. Estimate a directional competitive positioning (e.g., "top 20%", "top 40%") based on:
   - How many required skills, qualifications, and experiences they match
   - The depth and specificity of their matching experience
   - Their seniority level relative to the role
   - Relevant certifications or credentials
3. Identify 3–5 strong areas where the candidate clearly exceeds or meets requirements.
4. Identify 2–4 weak areas where the candidate falls short or has gaps.
5. Provide a confidence level for your estimate.
6. Write a brief, actionable recommendation.

Rules:
- This is a directional estimate based on requirement coverage, NOT actual applicant pool data.
- Be honest but encouraging — highlight genuine strengths while noting real gaps.
- "positioning" should be a natural-language estimate like "top 25% of typical applicants" or "competitive but not standout".
- strong_areas and weak_areas should be specific, not generic.
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Estimate the competitive positioning of this candidate for the target role.

=== CANDIDATE PROFILE ===
Name: ${resume.name}
Years of Experience: ${yearsExp}
Skills: ${skills}
Experience:
${experience}
Education:
${education}
${certifications ? `Certifications: ${certifications}` : ""}

=== TARGET JOB ===
${jobDescription}

Provide the competitive positioning assessment.`;

  return { systemPrompt, userPrompt };
}
