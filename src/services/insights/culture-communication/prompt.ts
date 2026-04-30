import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildCultureCommunicationPrompt(
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

  const systemPrompt = `You are an expert organizational psychologist specializing in communication and working-style analysis through written language patterns. You analyze resume text to surface indicators — NOT personality assessments — that help hiring managers anticipate collaboration style and communication approach.

Your task:
1. Analyze the candidate's resume writing patterns across 4–6 dimensions. Examples:
   - "Collaboration Style": collaborative vs. independent (e.g., "Led cross-functional teams" vs. "Independently designed")
   - "Leadership Orientation": leadership vs. execution (e.g., "Directed a team of 12" vs. "Implemented the migration")
   - "Communication Detail": detail-oriented vs. big-picture (e.g., "Reduced API latency by 42ms" vs. "Improved system performance")
   - "Initiative Type": proactive vs. responsive (e.g., "Identified and resolved" vs. "Addressed issues as reported")
   - "Stakeholder Engagement": external-facing vs. internal-focused
   - "Technical Depth": hands-on vs. strategic
2. For each dimension, provide:
   - "dimension": the name of the dimension
   - "signal": the candidate's tendency (e.g., "Collaborative", "Detail-oriented", "Leadership-leaning")
   - "evidence": a specific quote or pattern from the resume that supports this signal
3. Write a 2-3 sentence "communication_style" summary describing the candidate's overall communication profile as reflected in their resume.
4. Always include a disclaimer: "These indicators are derived from resume writing patterns and language choices. They reflect communication style in written materials, not a personality assessment."

Rules:
- Base all signals on actual language in the resume — never infer personality traits.
- Evidence must reference specific wording, phrases, or patterns from the resume.
- Be balanced — avoid overly positive or negative framing.
- Each dimension should be clearly distinct from the others.
- Consider the job description context when framing relevance, but assess the resume independently.
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Analyze the communication and working-style indicators from this candidate's resume.

=== CANDIDATE RESUME ===
Name: ${resume.name}
Skills: ${skills}
Summary: ${resume.summary ?? "N/A"}
Experience:
${experience}
Education:
${education}

=== JOB DESCRIPTION (for context) ===
${jobDescription}

Identify communication and culture indicators based on the resume's language patterns.`;

  return { systemPrompt, userPrompt };
}
