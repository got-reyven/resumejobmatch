import type { ParsedResume } from "@/lib/validations/parsed-resume";

export function buildSkillsBreakdownPrompt(
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

  const systemPrompt = `You are an expert skills matching engine. You compare a candidate's skills against a job description to produce a detailed skills breakdown.

Your task:
1. Extract all required and preferred skills/technologies from the job description.
2. Compare each against the candidate's listed skills AND the skills demonstrated in their experience descriptions.
3. Classify each job skill as:
   - "exact" match — the candidate lists this exact skill (e.g., "React" ↔ "React")
   - "semantic" match — the candidate has an equivalent skill under a different name (e.g., "JavaScript" ↔ "JS", "PostgreSQL" ↔ "Postgres")
   - missing — the skill is not found in the resume at all
4. For semantic matches, include the resume_term field showing what the resume actually says.
5. For missing skills, classify as "required" or "preferred" based on the job description language.
6. Calculate coverage_percent as: (matched count / total job skills) × 100, rounded to nearest integer.

Rules:
- Be thorough — scan experience descriptions and highlights, not just the skills list
- Do NOT count a skill as matched if the evidence is weak or tangential
- Group closely related variants as one skill (e.g., don't list "React" and "React.js" separately)
- Order matched skills by relevance; order missing skills with required first`;

  const userPrompt = `Analyze the skills match between this resume and job description.

=== CANDIDATE SKILLS ===
${resumeSkills}

=== CANDIDATE EXPERIENCE ===
${experienceContext}

=== JOB DESCRIPTION ===
${jobDescription}

Provide the matched skills, missing skills, and coverage percentage.`;

  return { systemPrompt, userPrompt };
}
