import type { ParsedResume } from "@/lib/validations/parsed-resume";
import { ANTI_INJECTION_PREAMBLE } from "@/services/prompt-injection/preamble";

export function buildCareerGapPrompt(
  resume: ParsedResume,
  jobDescription: string
) {
  const experience = resume.experience
    .map(
      (exp) =>
        `${exp.title} at ${exp.company} (${exp.start_date}–${exp.end_date ?? "Present"})`
    )
    .join("\n");
  const education = resume.education
    .map(
      (ed) =>
        `${ed.degree} in ${ed.field_of_study ?? "N/A"} from ${ed.institution} (${ed.start_year ?? "?"}–${ed.end_year ?? "?"})`
    )
    .join("\n");

  const systemPrompt = `You are an expert HR analyst specializing in employment timeline analysis. Your task is to identify gaps in a candidate's employment history and provide constructive context.

Your task:
1. Analyze the candidate's experience timeline to identify gaps between roles longer than 3 months.
2. For each gap, note the approximate start ("from") and end ("to") dates in a readable format (e.g., "Jun 2022", "Jan 2023").
3. Calculate the duration in months.
4. Infer possible context where reasonable — education periods, freelance/consulting indicators, career transitions, relocation, or other clues from the resume. If no context can be inferred, set possible_context to null.
5. Set has_significant_gaps to true if any gap exceeds 6 months or there are 2+ gaps exceeding 3 months.
6. Write a 2–3 sentence summary that frames the gaps constructively:
   - For jobseekers: advice on how to address the gaps (e.g., "consider adding a note" or "highlight freelance work during this period")
   - For hiring managers: fair context (e.g., "gap coincides with graduate program" or "single 4-month gap between roles is typical for senior transitions")

Rules:
- Only flag gaps BETWEEN roles, not before the first role or after the last role.
- If the candidate's last role has an end date (not "Present"), do NOT treat time from that end date to now as a gap.
- Overlapping roles mean no gap — skip those transitions.
- Education overlapping a gap may explain it — note this in possible_context.
- Be constructive, not punitive. Gaps are common and often have valid explanations.
- If there are no gaps > 3 months, return an empty gaps array with has_significant_gaps: false.
- Order gaps chronologically (most recent first).
${ANTI_INJECTION_PREAMBLE}`;

  const userPrompt = `Analyze the employment timeline for gaps.

=== CANDIDATE RESUME ===
Name: ${resume.name}
Summary: ${resume.summary ?? "N/A"}
Experience:
${experience}
Education:
${education}

=== JOB DESCRIPTION ===
${jobDescription}

Identify all employment gaps longer than 3 months and provide constructive context.`;

  return { systemPrompt, userPrompt };
}
