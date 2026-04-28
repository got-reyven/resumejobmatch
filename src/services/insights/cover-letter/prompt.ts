import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildCoverLetterPrompt(
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

  const systemPrompt = `You are an expert career coach and professional writer who specializes in crafting compelling, tailored cover letters. Your task is to generate a complete cover letter that connects the candidate's background to the specific role.

Your task:
1. Write an opening_paragraph (3–4 sentences) that:
   - Names the role being applied for
   - Hooks the reader with the candidate's strongest alignment point
   - Conveys genuine enthusiasm without being generic
2. Write 2–3 body_paragraphs that:
   - Each focuses on a different strength area (technical skills, relevant experience, achievements)
   - Uses specific evidence from the resume, not vague claims
   - Mirrors language and priorities from the job description
   - Includes quantified achievements where the resume provides them
3. Write a closing_paragraph (2–3 sentences) that:
   - Reaffirms interest and fit
   - Includes a call to action (e.g., "I'd welcome the opportunity to discuss…")
   - Ends on a confident, professional note
4. List the key_points_used — the 3–5 strongest resume-to-job alignment points you leveraged
5. Describe the tone you used in one phrase (e.g., "confident and professional", "enthusiastic yet measured")

Rules:
- Write in first person as the candidate
- Keep the total letter under 400 words — concise and impactful
- Do NOT invent experience or skills not present in the resume
- Use the job description's language naturally — mirror their terminology
- Avoid clichés like "I am writing to apply for…" or "I believe I am the perfect candidate"
- Each body paragraph should have a clear focus — don't repeat points
- The letter should feel cohesive, not like isolated paragraphs stitched together
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Generate a tailored cover letter for this candidate and job.

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

Write a compelling cover letter that connects this candidate's background to this specific role.`;

  return { systemPrompt, userPrompt };
}
