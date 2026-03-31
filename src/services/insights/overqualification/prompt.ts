import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildOverqualificationPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const skillsList =
    resume.skills.length > 0 ? resume.skills.join(", ") : "(none listed)";

  const experienceContext =
    resume.experience.length > 0
      ? resume.experience
          .map((e) => {
            const parts = [`${e.title} at ${e.company}`];
            if (e.start_date && e.end_date)
              parts.push(`${e.start_date} – ${e.end_date}`);
            if (e.description) parts.push(e.description);
            if (e.highlights.length > 0) parts.push(e.highlights.join("; "));
            return parts.join(" | ");
          })
          .join("\n")
      : "(no experience listed)";

  const educationContext =
    resume.education.length > 0
      ? resume.education
          .map((ed) =>
            [
              ed.degree,
              ed.field_of_study,
              ed.institution,
              ed.start_year,
              ed.end_year,
            ]
              .filter(Boolean)
              .join(" — ")
          )
          .join("\n")
      : "(no education listed)";

  const certContext =
    resume.certifications.length > 0
      ? resume.certifications
          .map((c) => [c.name, c.issuer, c.year].filter(Boolean).join(" — "))
          .join("\n")
      : "(no certifications listed)";

  const responsibilitiesContext =
    resume.key_responsibilities.length > 0
      ? resume.key_responsibilities.join("; ")
      : "";

  const systemPrompt = `You are an expert hiring advisor who assesses whether a candidate is significantly overqualified for a given role. Your goal is to help hiring managers identify potential flight risks and salary mismatches early.

Your task:
1. Compare the candidate's seniority level, years of experience, skill depth, education, and title progression against the role's requirements and level.
2. Determine whether the candidate is meaningfully overqualified — not just slightly above the bar but significantly beyond what the role demands.
3. Set is_overqualified to true ONLY when the gap is substantial. Minor overqualification should result in false with a reassuring recommendation.
4. Rate your confidence:
   - "high" — clear, strong signals (e.g., a Director applying for a Junior role, 15+ years for a 2-year requirement)
   - "moderate" — some signals but context could change the assessment
   - "low" — borderline case, limited data to judge
5. Provide specific indicators — concrete evidence from the resume that supports your assessment. Each indicator should be a short, factual statement (e.g., "10+ years of experience vs. 2-year requirement", "Previous title was VP of Engineering, applying for Senior Engineer").
6. Write a recommendation for the hiring manager: what to consider, how to address it in the interview, and whether it's a concern or manageable.

Rules:
- Be conservative — only flag true overqualification, not strong candidates.
- Consider career changers, industry switchers, and people returning from breaks who may appear overqualified on paper but aren't.
- Focus on seniority gap, experience-years gap, title-level mismatch, and education level vs. requirements.
- Provide 2–5 indicators when overqualified, or 1–2 reassuring points when not.
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Assess whether this candidate is overqualified for the target role.

=== CANDIDATE SKILLS ===
${skillsList}
${responsibilitiesContext ? `\n=== CANDIDATE KEY RESPONSIBILITIES ===\n${responsibilitiesContext}` : ""}
=== CANDIDATE EXPERIENCE ===
${experienceContext}

=== CANDIDATE EDUCATION ===
${educationContext}

=== CANDIDATE CERTIFICATIONS ===
${certContext}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

Provide the overqualification assessment.`;

  return { systemPrompt, userPrompt };
}
