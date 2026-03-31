import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildExperienceAlignmentPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const experienceContext = resume.experience
    .map((e) => {
      const parts = [
        e.title,
        e.company,
        e.start_date && e.end_date ? `${e.start_date} – ${e.end_date}` : null,
        e.description,
      ].filter(Boolean);
      if (e.highlights.length > 0) parts.push(e.highlights.join("; "));
      return parts.join(" — ");
    })
    .join("\n");

  const educationContext = resume.education
    .map((ed) =>
      [ed.degree, ed.institution, ed.field_of_study].filter(Boolean).join(" — ")
    )
    .join("\n");

  const systemPrompt = `You are an expert career alignment analyzer. You map a candidate's work experience to a job's requirements to assess experience fit.

Your task:
1. Determine the total years of relevant experience the candidate has for this specific role.
2. Extract the required years of experience from the job description (null if not stated).
3. Assess seniority fit:
   - "under" — candidate appears less experienced than the role requires
   - "match" — candidate's seniority level aligns well with the role
   - "over" — candidate appears significantly more experienced than the role requires
4. Assess industry alignment:
   - "same" — candidate has worked in the same industry
   - "adjacent" — candidate has worked in a related industry with transferable context
   - "different" — candidate's industry background is unrelated
5. Map each resume role to the job requirements:
   - "direct" — the role directly provides experience the job asks for
   - "transferable" — the role develops skills applicable to the job, though not a direct match
   - "unrelated" — the role has little relevance to this job
   - List 1-3 relevant_aspects explaining why the role is relevant (empty array for unrelated)
6. Write a 1-2 sentence summary of the overall experience alignment.

Rules:
- Be accurate with years — estimate from dates if provided, otherwise from role descriptions
- Consider both explicit requirements and implied seniority from the job title/description
- relevant_aspects should be specific (e.g., "3 years managing React applications" not just "React")
- Order role_mapping from most relevant to least relevant
${ANTI_INJECTION_PREAMBLE}`;

  const responsibilitiesContext =
    resume.key_responsibilities.length > 0
      ? resume.key_responsibilities.join("; ")
      : "";

  const userPrompt = `Analyze the experience alignment between this candidate and the job.

=== CANDIDATE EXPERIENCE ===
${experienceContext}
${responsibilitiesContext ? `\n=== CANDIDATE KEY RESPONSIBILITIES ===\n${responsibilitiesContext}` : ""}
=== CANDIDATE EDUCATION ===
${educationContext}

=== CANDIDATE SKILLS ===
${resume.skills.join(", ")}

=== JOB DESCRIPTION ===
${jobDescription}

Provide the experience alignment analysis.`;

  return { systemPrompt, userPrompt };
}
