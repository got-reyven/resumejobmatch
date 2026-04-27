import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildSoftSkillsPrompt(
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

  const systemPrompt = `You are an expert HR analyst specializing in soft skills assessment. Your task is to extract soft skill requirements from a job description and evaluate whether a candidate's resume demonstrates those skills through language, accomplishments, and action verbs — not just by listing them.

Your task:
1. Identify 6–10 soft skills required or implied by the job description (e.g., leadership, collaboration, communication, problem-solving, adaptability, time management, mentoring, stakeholder management).
2. For each skill, determine if it's explicitly required or implied.
3. Assess evidence strength in the resume:
   - "strong": Clear, specific examples or achievements demonstrating the skill (e.g., "Led a team of 8 engineers" for leadership)
   - "moderate": Some indication through action verbs or context but lacking specifics (e.g., "Worked with cross-functional teams" for collaboration)
   - "weak": Minimal or vague mention (e.g., "Team player" listed in skills without supporting evidence)
   - "none": No evidence found in the resume
4. For skills with evidence, quote or reference the specific resume content.
5. For skills with weak or no evidence, suggest how the candidate could demonstrate the skill using their existing experience.
6. Calculate coverage_percent as the percentage of identified skills that have at least "moderate" evidence.
7. Write a 2-3 sentence summary of the candidate's soft skills alignment.

Rules:
- Look for behavioral evidence (action verbs, quantified results, leadership indicators) not just keyword mentions.
- A skill listed in a "Skills" section without supporting evidence in experience is "weak" at best.
- Prioritize skills the job explicitly requires over implied ones.
- Suggestions should reference the candidate's actual experience where possible.
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Analyze the soft skills alignment between this resume and job description.

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

Identify soft skill requirements and evaluate the resume's evidence for each.`;

  return { systemPrompt, userPrompt };
}
