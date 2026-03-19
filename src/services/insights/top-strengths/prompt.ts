import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildTopStrengthsPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const resumeSkills = resume.skills.join(", ");

  const experienceContext = resume.experience
    .map((e) => {
      const parts = [`${e.title} at ${e.company}`];
      if (e.start_date)
        parts.push(`(${e.start_date} – ${e.end_date ?? "Present"})`);
      if (e.description) parts.push(e.description);
      if (e.highlights.length > 0) parts.push(e.highlights.join("; "));
      return parts.join(" — ");
    })
    .join("\n");

  const educationSummary = resume.education
    .map((e) => {
      let line = e.degree;
      if (e.field_of_study) line += ` in ${e.field_of_study}`;
      line += ` — ${e.institution}`;
      if (e.year) line += ` (${e.year})`;
      return line;
    })
    .join("\n");

  const systemPrompt = `You are an expert hiring advisor. You analyze a candidate's resume against a job description to identify the top areas where the candidate strongly meets or exceeds requirements. This helps hiring managers quickly understand why this candidate is worth considering.

Rules:
1. Identify 1–3 key strengths where the candidate clearly excels relative to the job requirements.
2. Each strength must have:
   - "area": A concise label for the strength (e.g., "Frontend Architecture", "Team Leadership")
   - "evidence": A specific, concrete fact from the resume that proves this strength (cite titles, projects, years, or achievements — max 30 words)
   - "relevance": One sentence explaining how this strength directly maps to a specific job requirement (max 25 words)
3. Rank strengths by relevance to the role's most critical needs (required > preferred).
4. Consider both explicit matches (listed skills) and inferred strengths (e.g., leadership from senior titles, breadth from diverse experience).
5. Do NOT list weaknesses or gaps — this insight is purely about what the candidate brings.
6. Be factual and evidence-based — never speculate beyond what the resume states.`;

  const responsibilitiesContext =
    resume.key_responsibilities.length > 0
      ? resume.key_responsibilities.join("; ")
      : "None listed";

  const userPrompt = `Identify the top strengths of this candidate for the given job.

=== CANDIDATE SKILLS ===
${resumeSkills || "None listed"}

=== CANDIDATE KEY RESPONSIBILITIES ===
${responsibilitiesContext}

=== CANDIDATE EXPERIENCE ===
${experienceContext || "None listed"}

=== CANDIDATE EDUCATION ===
${educationSummary || "None listed"}

=== CANDIDATE SUMMARY ===
${resume.summary || "No summary provided"}

=== CERTIFICATIONS ===
${resume.certifications.map((c) => `${c.name}${c.issuer ? ` (${c.issuer})` : ""}`).join(", ") || "None listed"}

=== JOB DESCRIPTION ===
${jobDescription}

Provide the top 1–3 strengths with evidence and relevance.`;

  return { systemPrompt, userPrompt };
}
