import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildQualificationFitPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const educationContext = resume.education
    .map((ed) =>
      [ed.degree, ed.field_of_study, ed.institution, ed.start_year, ed.end_year]
        .filter(Boolean)
        .join(" — ")
    )
    .join("\n");

  const certContext =
    resume.certifications.length > 0
      ? resume.certifications.join("\n")
      : "(none listed)";

  const experienceContext = resume.experience
    .map((e) => {
      const parts = [e.title, e.company, e.description].filter(Boolean);
      if (e.highlights.length > 0) parts.push(e.highlights.join("; "));
      return parts.join(" — ");
    })
    .join("\n");

  const systemPrompt = `You are an expert qualification assessor. You evaluate whether a candidate meets the educational, certification, and credential requirements listed in a job description.

Your task:
1. Extract every qualification requirement from the job description — degrees, certifications, licenses, clearances, and other credentials.
2. Classify each as "required" or "preferred" based on the job description language (e.g., "must have" = required, "nice to have" / "preferred" = preferred).
3. Check the candidate's resume for evidence of each qualification:
   - "met" — the resume clearly demonstrates this qualification
   - "partially_met" — the resume shows a related but not exact match (e.g., BS in Math for a BS in CS requirement, or equivalent experience)
   - "not_found" — no evidence found in the resume
4. For "met" and "partially_met" statuses, provide the specific evidence from the resume.
5. For "partially_met" and "not_found" statuses, provide a brief note explaining what was found or suggesting what the candidate could add.
6. Write a 1-2 sentence summary of the overall qualification fit.

Rules:
- If the job description lists no explicit qualifications, return an empty qualifications array and a summary noting that.
- Consider "equivalent experience" clauses — if the job says "BS or equivalent experience" and the candidate has relevant experience, mark as "met" or "partially_met".
- Be specific in evidence — cite the actual degree, certification, or credential from the resume.
- Order qualifications with required items first, then preferred.
${ANTI_INJECTION_PREAMBLE}`;

  const responsibilitiesContext =
    resume.key_responsibilities.length > 0
      ? resume.key_responsibilities.join("; ")
      : "";

  const userPrompt = `Evaluate the candidate's qualification fit for this role.

=== CANDIDATE EDUCATION ===
${educationContext || "(none listed)"}

=== CANDIDATE CERTIFICATIONS ===
${certContext}

=== CANDIDATE EXPERIENCE ===
${experienceContext}
${responsibilitiesContext ? `\n=== CANDIDATE KEY RESPONSIBILITIES ===\n${responsibilitiesContext}` : ""}
=== CANDIDATE SKILLS ===
${resume.skills.join(", ")}

=== JOB DESCRIPTION ===
${jobDescription}

Provide the qualification fit analysis.`;

  return { systemPrompt, userPrompt };
}
