import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildTailoredSummaryPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const currentSummary = resume.summary || "(no summary section in resume)";

  const skillsList =
    resume.skills.length > 0 ? resume.skills.join(", ") : "(none listed)";

  const experienceContext =
    resume.experience.length > 0
      ? resume.experience
          .slice(0, 5)
          .map((e) => {
            const parts = [`${e.title} at ${e.company}`];
            if (e.description) parts.push(e.description);
            if (e.highlights.length > 0) parts.push(e.highlights.join("; "));
            return parts.join(" — ");
          })
          .join("\n")
      : "(no experience listed)";

  const systemPrompt = `You are an expert resume writer and career coach. You specialize in writing compelling professional summaries tailored to specific job descriptions.

Your task:
1. Read the candidate's current professional summary (if any), their skills, and experience.
2. Read the target job description carefully.
3. Write a new professional summary (3–4 sentences) that:
   - Opens with the candidate's strongest qualification for THIS specific role
   - Incorporates keywords and language from the job description naturally
   - Highlights the most relevant skills and experience
   - Ends with a forward-looking statement about what the candidate brings to the role
4. List the key changes you made compared to the current summary (or what you added if there was none).

Rules:
- The summary must be truthful — only reference skills and experience actually present in the resume.
- Use confident, professional tone — no clichés like "results-driven" or "team player" unless they appear in the job description.
- Keep it to 3–4 sentences, approximately 50–80 words.
- If the current summary is already strong for this role, still provide an optimized version but note minimal changes.
- For current_summary, return the candidate's existing summary text as-is (or null if none exists).
- For key_changes, list 2–5 specific improvements (e.g., "Added React and TypeScript keywords from job requirements", "Reframed 8 years of experience to emphasize frontend architecture").`;

  const responsibilitiesContext =
    resume.key_responsibilities.length > 0
      ? resume.key_responsibilities.join("; ")
      : "";

  const userPrompt = `Write a tailored professional summary for this candidate targeting the job below.

=== CURRENT SUMMARY ===
${currentSummary}

=== CANDIDATE SKILLS ===
${skillsList}
${responsibilitiesContext ? `\n=== CANDIDATE KEY RESPONSIBILITIES ===\n${responsibilitiesContext}` : ""}
=== CANDIDATE EXPERIENCE (most recent) ===
${experienceContext}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

Provide the tailored summary suggestion.`;

  return { systemPrompt, userPrompt };
}
