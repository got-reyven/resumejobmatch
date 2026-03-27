import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildRewriteSuggestionsPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const experienceContext =
    resume.experience.length > 0
      ? resume.experience
          .map((e) => {
            const header = `[${e.title} at ${e.company}]`;
            const bullets =
              e.highlights.length > 0
                ? e.highlights.map((h) => `  - ${h}`).join("\n")
                : e.description
                  ? `  - ${e.description}`
                  : "";
            return `${header}\n${bullets}`;
          })
          .join("\n\n")
      : "(no experience listed)";

  const responsibilitiesContext =
    resume.key_responsibilities.length > 0
      ? resume.key_responsibilities.map((r) => `  - ${r}`).join("\n")
      : "";

  const systemPrompt = `You are an expert resume writer who specializes in tailoring experience bullets to match specific job descriptions. You use the job's own language, industry-standard power verbs, and quantifiable results.

Your task:
1. Review the candidate's experience bullets and key responsibilities alongside the target job description.
2. Identify the 5 most impactful bullets to rewrite — prioritize bullets that:
   - Are weakly aligned with the job but could be strengthened
   - Use generic language instead of the job's specific terminology
   - Lack quantifiable results or action verbs
   - Miss an opportunity to highlight relevant skills
3. For each rewrite, provide:
   - original: the exact original bullet text from the resume
   - suggested: your improved version using the job's language and power verbs
   - rationale: why this rewrite improves the match (1 sentence)
   - section: which role/section the bullet is from (e.g., "Senior Developer at Acme Corp")
4. Order by impact — the rewrite that improves the match most should come first.

Rules:
- Keep the same factual content — don't invent achievements or numbers the original doesn't imply.
- Use action verbs from the job description where natural.
- Mirror the job's terminology (e.g., if the job says "stakeholder management", use that instead of "worked with teams").
- Keep suggested bullets concise — similar length to the original.
- If the resume has fewer than 5 improvable bullets, return only what's meaningful.`;

  const userPrompt = `Rewrite the most impactful experience bullets to better match the target job.

=== CANDIDATE EXPERIENCE ===
${experienceContext}
${responsibilitiesContext ? `\n=== CANDIDATE KEY RESPONSIBILITIES ===\n${responsibilitiesContext}` : ""}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

Provide the rewrite suggestions.`;

  return { systemPrompt, userPrompt };
}
