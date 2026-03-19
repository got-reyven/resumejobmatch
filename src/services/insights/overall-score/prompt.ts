import type { ParsedResume } from "@/lib/validations/parsed-resume";

function formatResume(resume: ParsedResume): string {
  const sections: string[] = [];

  sections.push(`Name: ${resume.name}`);
  if (resume.summary) sections.push(`Summary: ${resume.summary}`);
  if (resume.skills.length > 0)
    sections.push(`Skills: ${resume.skills.join(", ")}`);

  if (resume.key_responsibilities.length > 0) {
    sections.push(
      `Key Responsibilities: ${resume.key_responsibilities.join("; ")}`
    );
  }

  if (resume.experience.length > 0) {
    const expLines = resume.experience.map((e) => {
      let line = `- ${e.title} at ${e.company}`;
      if (e.start_date)
        line += ` (${e.start_date} – ${e.end_date ?? "Present"})`;
      if (e.description) line += `\n  ${e.description}`;
      if (e.highlights.length > 0) line += `\n  ${e.highlights.join("; ")}`;
      return line;
    });
    sections.push(`Experience:\n${expLines.join("\n")}`);
  }

  if (resume.total_years_experience != null) {
    sections.push(
      `Total Years of Experience: ${resume.total_years_experience}`
    );
  }

  if (resume.education.length > 0) {
    const eduLines = resume.education.map((e) => {
      let line = `- ${e.degree}`;
      if (e.field_of_study) line += ` in ${e.field_of_study}`;
      line += ` — ${e.institution}`;
      if (e.year) line += ` (${e.year})`;
      return line;
    });
    sections.push(`Education:\n${eduLines.join("\n")}`);
  }

  if (resume.certifications.length > 0) {
    const certLines = resume.certifications.map(
      (c) => `- ${c.name}${c.issuer ? ` (${c.issuer})` : ""}`
    );
    sections.push(`Certifications:\n${certLines.join("\n")}`);
  }

  return sections.join("\n\n");
}

export function buildOverallScorePrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const formattedResume = formatResume(resume);

  const systemPrompt = `You are an expert resume-to-job matching engine. You evaluate how well a candidate's resume matches a specific job description.

Score the match across 4 weighted dimensions:
1. Skills (40% weight) — How many required/preferred skills does the candidate have? Consider exact matches and semantic equivalents (e.g., "JS" ≈ "JavaScript").
2. Experience (30% weight) — Does the candidate's work history demonstrate relevant experience? Consider years, seniority, and domain relevance.
3. Qualifications (20% weight) — Does the candidate meet stated requirements like degrees, certifications, clearances?
4. Overall Fit (10% weight) — Holistic assessment: industry alignment, career trajectory, role suitability.

Scoring rules:
- Each dimension score is 0–100 independently
- The overall score is the weighted average: (skills × 0.4) + (experience × 0.3) + (qualifications × 0.2) + (overall_fit × 0.1)
- Be fair but honest — do not inflate scores
- If the job description lacks explicit requirements for a dimension, score based on reasonable inference from context
- The summary should be 1–2 sentences explaining the overall match in plain language`;

  const userPrompt = `Evaluate this resume against the job description and provide match scores.

=== RESUME ===
${formattedResume}

=== JOB DESCRIPTION ===
${jobDescription}

Provide the overall match score, dimension scores, and a brief summary.`;

  return { systemPrompt, userPrompt };
}
