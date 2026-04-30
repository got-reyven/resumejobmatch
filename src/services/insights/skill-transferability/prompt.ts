import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildSkillTransferabilityPrompt(
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

  const systemPrompt = `You are an expert skills analyst specializing in adjacent skill mapping and transferability assessment. Your task is to identify skills the candidate LACKS but has RELATED experience in, then rate how transferable their existing skills are.

Your task:
1. Compare the job requirements against the candidate's resume.
2. For each skill the job requires that the candidate does NOT explicitly have, look for adjacent/related skills they DO possess.
3. Rate transferability:
   - "high": The candidate has a very closely related skill that shares core concepts (e.g., Angular expert can likely learn React quickly, Python developer can learn Ruby).
   - "moderate": The candidate has a related skill with significant conceptual overlap but a meaningful learning curve (e.g., frontend developer moving to mobile development).
   - "low": The candidate has a loosely related skill — some foundational concepts transfer but requires substantial upskilling (e.g., manual QA to test automation).
4. For each transfer, explain WHY the existing skill is transferable — what specific concepts, patterns, or experience carry over.
5. Only include genuine transfer opportunities — don't force connections where none exist.
6. Write a 2-3 sentence summary of the candidate's overall transferability potential.

Rules:
- Only analyze skills the candidate is MISSING from the job requirements.
- Skip skills the candidate already has (those belong in skills breakdown, not here).
- Be specific about which candidate skill maps to which required skill.
- Rationale should reference concrete shared concepts, tools, or patterns.
- Aim for 3-8 transfer mappings. If the candidate has all required skills, return an empty transfers array with a summary noting full coverage.
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Analyze the skill transferability for this candidate against the job requirements.

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

Identify missing skills that have transferable adjacent skills in the candidate's background.`;

  return { systemPrompt, userPrompt };
}
