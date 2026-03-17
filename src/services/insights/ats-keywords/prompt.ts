import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildATSKeywordsPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const resumeSkills = resume.skills.join(", ");

  const experienceContext = resume.experience
    .map((e) => {
      const parts = [e.title, e.company, e.description].filter(Boolean);
      if (e.highlights.length > 0) parts.push(e.highlights.join("; "));
      return parts.join(" — ");
    })
    .join("\n");

  const educationContext = resume.education
    .map((ed) =>
      [ed.degree, ed.institution, ed.field_of_study].filter(Boolean).join(" — ")
    )
    .join("\n");

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) keyword analyzer. Your job is to identify the critical keywords and phrases from a job description that an ATS would scan for, and check whether they appear in the candidate's resume.

Your task:
1. Extract all important keywords and phrases from the job description that an ATS would look for.
2. Categorize each keyword as one of: "technical" (programming languages, frameworks, methodologies), "tool" (software, platforms, services), "certification" (degrees, certifications, licenses), "soft_skill" (communication, leadership, collaboration), or "other".
3. Check the candidate's resume (skills, experience, education) for each keyword:
   - "exact" — the keyword appears verbatim or with trivial variation (e.g., "React" ↔ "React.js")
   - "semantic" — an equivalent term appears (e.g., "PostgreSQL" ↔ "Postgres", "team player" ↔ "collaborative")
   - "missing" — the keyword is not found in any form
4. For exact and semantic matches, provide resume_context showing where/how the resume mentions it.
5. For missing keywords, set resume_context to null.
6. Assess ats_pass_likelihood:
   - "high" — 75%+ of critical keywords found (likely to pass automated screening)
   - "medium" — 50-74% found (borderline, adding a few keywords could help)
   - "low" — below 50% found (major keyword gaps, needs significant tailoring)
7. Provide a concise suggestion (1-2 sentences) on the most impactful keywords to add.

Rules:
- Focus on keywords an ATS would actually scan for — skip generic filler words
- Prioritize technical skills and tools over soft skills in your extraction
- Extract 10-20 keywords for a typical job description
- Be accurate about match classification — don't inflate found_in_resume
- Order keywords by importance (most critical for the role first)`;

  const userPrompt = `Analyze the ATS keyword match between this resume and job description.

=== CANDIDATE SKILLS ===
${resumeSkills}

=== CANDIDATE EXPERIENCE ===
${experienceContext}

=== CANDIDATE EDUCATION ===
${educationContext}

=== JOB DESCRIPTION ===
${jobDescription}

Extract the critical ATS keywords, check the resume for each, and provide the pass likelihood assessment.`;

  return { systemPrompt, userPrompt };
}
