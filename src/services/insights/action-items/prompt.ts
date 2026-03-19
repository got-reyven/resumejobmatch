import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildActionItemsPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const resumeSkills = resume.skills.join(", ");

  const experienceSummary = resume.experience
    .map((e) => {
      let line = `${e.title} at ${e.company}`;
      if (e.start_date)
        line += ` (${e.start_date} – ${e.end_date ?? "Present"})`;
      if (e.description) line += ` — ${e.description}`;
      return line;
    })
    .join("\n");

  const educationSummary = resume.education
    .map((e) => {
      let line = `${e.degree}`;
      if (e.field_of_study) line += ` in ${e.field_of_study}`;
      line += ` — ${e.institution}`;
      return line;
    })
    .join("\n");

  const systemPrompt = `You are an expert resume coach. You analyze the gap between a candidate's resume and a job description, then generate exactly 3 prioritized, specific action items the candidate should take to improve their match.

Rules:
1. Generate exactly 3 action items, ordered by impact (action #1 has the highest impact on match score).
2. Each action must target a specific resume section: "skills", "experience", "summary", "education", or "certifications".
3. The title should be a concise imperative action (e.g., "Add Docker to your skills section").
4. The "bullets" field must be an array of 2–4 short, scannable bullet points:
   - First bullet: WHY this matters for this specific job
   - Next bullet(s): HOW to implement it with concrete wording or examples
   - Keep each bullet under 25 words — concise and actionable
5. Impact classification:
   - "high" = directly addresses a required skill, qualification, or key responsibility
   - "medium" = addresses a preferred skill or strengthens overall positioning
6. Focus on gaps that are realistically addressable — don't suggest fabricating experience.
7. Prioritize adding missing required skills over refining existing content.
8. Be specific to this job — generic advice like "tailor your resume" is not acceptable.`;

  const responsibilitiesContext =
    resume.key_responsibilities.length > 0
      ? resume.key_responsibilities.join("; ")
      : "None listed";

  const userPrompt = `Analyze this resume against the job description and provide the top 3 action items to improve the match.

=== CANDIDATE SKILLS ===
${resumeSkills || "None listed"}

=== CANDIDATE KEY RESPONSIBILITIES ===
${responsibilitiesContext}

=== CANDIDATE EXPERIENCE ===
${experienceSummary || "None listed"}

=== CANDIDATE EDUCATION ===
${educationSummary || "None listed"}

=== CANDIDATE SUMMARY ===
${resume.summary || "No summary provided"}

=== JOB DESCRIPTION ===
${jobDescription}

Provide exactly 3 action items ranked by impact.`;

  return { systemPrompt, userPrompt };
}
