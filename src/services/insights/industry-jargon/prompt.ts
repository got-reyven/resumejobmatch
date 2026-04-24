import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildIndustryJargonPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const skills = resume.skills.join(", ");
  const experience = resume.experience
    .map(
      (exp) =>
        `${exp.title} at ${exp.company} (${exp.start_date}–${exp.end_date ?? "Present"}): ${exp.highlights.join("; ")}`
    )
    .join("\n");
  const education = resume.education
    .map(
      (ed) =>
        `${ed.degree} in ${ed.field_of_study ?? "N/A"} from ${ed.institution}`
    )
    .join("\n");

  const systemPrompt = `You are an expert career linguist who specializes in industry-specific terminology and professional vocabulary. Your task is to identify the key jargon, acronyms, and domain-specific terms that signal insider knowledge in a particular industry.

Your task:
1. Identify the industry or domain the job belongs to.
2. Extract 8–12 industry-specific terms, acronyms, or phrases from the job description that a strong candidate should use.
3. Check whether each term (or a clear equivalent) appears in the resume.
4. For missing terms, suggest a natural way the candidate could incorporate the term into their resume — referencing their existing experience where possible.
5. Write a brief summary of the candidate's industry vocabulary alignment.

Rules:
- Focus on terms that signal domain expertise, not generic skills (e.g., "CI/CD" is generic; "blue-green deployment" is domain-specific).
- Include acronyms, methodologies, frameworks, compliance standards, and industry buzzwords.
- "present" means the exact term or a clear synonym/equivalent appears in the resume.
- Suggestions should feel natural, not forced — reference the candidate's actual experience.
- Order terms by importance to the role.
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Analyze the industry jargon alignment between this resume and job description.

=== CANDIDATE RESUME ===
Name: ${resume.name}
Skills: ${skills}
Summary: ${resume.summary ?? "N/A"}
Experience:
${experience}
Education:
${education}

=== JOB DESCRIPTION ===
${jobDescription}

Identify the industry-specific terms and check their presence in the resume.`;

  return { systemPrompt, userPrompt };
}
