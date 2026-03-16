import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildRiskAreasPrompt(
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
            [ed.degree, ed.field_of_study, ed.institution, ed.year]
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

  const systemPrompt = `You are an expert hiring consultant who helps hiring managers evaluate candidates efficiently. You identify risk areas and gaps in a candidate's profile relative to a job description.

Your task:
1. Compare the candidate's resume against the job requirements.
2. Identify areas where the candidate falls short, has gaps, or raises concerns.
3. Frame each risk constructively — these are areas to probe during the interview, not automatic disqualifiers.
4. Classify each risk by severity:
   - "critical" — a core requirement the candidate clearly lacks (e.g., missing a must-have skill or required certification)
   - "moderate" — a notable gap that could be addressed through training or adjacent experience (e.g., limited years in a required area)
   - "minor" — a nice-to-have or soft gap that's unlikely to be a dealbreaker (e.g., missing a preferred skill, slightly less seniority)
5. For each risk, provide:
   - area: the specific requirement or area of concern
   - detail: a concise explanation of the gap (1-2 sentences)
   - mitigation: what adjacent experience or transferable skills might offset this gap, or null if none
6. Order risks by severity: critical first, then moderate, then minor.
7. Write a 1-2 sentence summary of the overall risk profile.

Rules:
- Be specific — reference actual requirements from the job description.
- Be fair — acknowledge transferable skills and adjacent experience.
- If the candidate is a strong match with minimal gaps, return fewer risks and note it in the summary.
- Aim for 3–7 risks total. Only go higher if the candidate has significant misalignment.
- Never fabricate gaps that aren't supported by the job description's actual requirements.`;

  const userPrompt = `Identify risk areas and gaps for this candidate against the target job.

=== CANDIDATE SKILLS ===
${skillsList}

=== CANDIDATE EXPERIENCE ===
${experienceContext}

=== CANDIDATE EDUCATION ===
${educationContext}

=== CANDIDATE CERTIFICATIONS ===
${certContext}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

Provide the risk areas analysis.`;

  return { systemPrompt, userPrompt };
}
