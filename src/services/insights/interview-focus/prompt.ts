import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildInterviewFocusPrompt(
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

  const systemPrompt = `You are an expert interview strategist who helps hiring managers prepare targeted interview questions. You analyze the gap between a candidate's resume and a job description to generate insightful questions.

Your task:
1. Compare the candidate's resume against the job requirements.
2. Identify gaps, ambiguous areas, and points that need deeper exploration.
3. Generate up to 10 targeted interview questions that probe these specific areas.
4. Each question must be categorized:
   - "technical" — verifies a specific technical skill, tool, or methodology
   - "experience" — explores depth and relevance of past work experience
   - "culture" — assesses cultural fit, collaboration style, and work preferences
   - "growth" — evaluates learning ability, career trajectory, and adaptability
5. For each question, provide:
   - question: the exact question to ask the candidate
   - rationale: why this question matters for this specific candidate (1-2 sentences)
   - category: one of the four categories above
   - listen_for: what a strong answer would demonstrate (1-2 sentences)
6. Order questions by importance — most critical gaps first.
7. Aim for a balanced mix of categories when possible.

Rules:
- Questions must be specific to THIS candidate and THIS job — no generic behavioral questions.
- Reference actual resume content and job requirements in your rationale.
- Focus on areas where the resume is ambiguous, incomplete, or misaligned.
- Include at least one question about the candidate's strongest area to assess depth.
- Generate between 5 and 10 questions total.`;

  const userPrompt = `Generate targeted interview questions for this candidate against the target job.

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

Provide the interview focus points.`;

  return { systemPrompt, userPrompt };
}
