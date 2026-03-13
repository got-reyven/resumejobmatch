import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildSectionStrengthPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const summarySection = resume.summary || "(no summary section found)";

  const skillsSection =
    resume.skills.length > 0 ? resume.skills.join(", ") : "(no skills listed)";

  const experienceSection =
    resume.experience.length > 0
      ? resume.experience
          .map((e) => {
            const parts = [
              `${e.title} at ${e.company}`,
              e.start_date && e.end_date
                ? `${e.start_date} – ${e.end_date}`
                : null,
              e.description,
            ].filter(Boolean);
            if (e.highlights.length > 0) parts.push(e.highlights.join("; "));
            return parts.join(" | ");
          })
          .join("\n")
      : "(no experience listed)";

  const educationSection =
    resume.education.length > 0
      ? resume.education
          .map((ed) =>
            [ed.degree, ed.field_of_study, ed.institution, ed.year]
              .filter(Boolean)
              .join(" — ")
          )
          .join("\n")
      : "(no education listed)";

  const certSection =
    resume.certifications.length > 0
      ? resume.certifications
          .map((c) => [c.name, c.issuer, c.year].filter(Boolean).join(" — "))
          .join("\n")
      : "(no certifications listed)";

  const systemPrompt = `You are an expert resume reviewer. You evaluate each section of a candidate's resume against a specific job description.

Your task:
1. Evaluate the following resume sections for their relevance and effectiveness against the target job:
   - summary (professional summary / objective)
   - skills (listed skills and technologies)
   - experience (work history, roles, accomplishments)
   - education (degrees, institutions, fields of study)
   - certifications (professional certifications, licenses)
2. Score each section from 1 to 5:
   - 5 = Excellent — section is highly relevant, well-written, and strongly aligned with the job
   - 4 = Good — section is relevant with minor gaps
   - 3 = Adequate — section is present but could be significantly improved for this role
   - 2 = Weak — section exists but is poorly aligned with the job requirements
   - 1 = Very Weak — section is missing, empty, or irrelevant to the role
3. For each section provide:
   - feedback: a concise explanation of why you gave this score (1-2 sentences)
   - suggestion: a specific, actionable improvement tip for this job (1-2 sentences), or null if score is 5
4. Identify the weakest section (the one with the lowest score) in the "weakest" field.
5. Write a 1-2 sentence overall summary of the resume's section quality.

Rules:
- Always evaluate all 5 sections, even if a section is empty (score it 1 with appropriate feedback).
- If a section is empty or missing, the suggestion should recommend what to add.
- Score relative to the specific job — a great section for one job might be weak for another.
- Order sections as: summary, skills, experience, education, certifications.
- The "weakest" field should contain the name value (e.g., "skills", "experience").`;

  const userPrompt = `Evaluate each resume section against this job description.

=== RESUME: SUMMARY ===
${summarySection}

=== RESUME: SKILLS ===
${skillsSection}

=== RESUME: EXPERIENCE ===
${experienceSection}

=== RESUME: EDUCATION ===
${educationSection}

=== RESUME: CERTIFICATIONS ===
${certSection}

=== JOB DESCRIPTION ===
${jobDescription}

Provide the section-by-section strength analysis.`;

  return { systemPrompt, userPrompt };
}
