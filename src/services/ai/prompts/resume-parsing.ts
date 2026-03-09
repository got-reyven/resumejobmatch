const MAX_INPUT_LENGTH = 8000;

export function buildResumeParsingPrompt(resumeText: string) {
  const truncatedText = resumeText.slice(0, MAX_INPUT_LENGTH);

  return {
    systemPrompt: `You are an expert resume parser. Extract structured data from the provided resume text.

Rules:
- Extract all identifiable fields as accurately as possible
- If a field cannot be determined from the text, use null
- Skills should be individual items (e.g. "TypeScript", "React"), not grouped phrases
- For experience entries, include the role title, company, dates, and key responsibilities
- Estimate total_years_experience from the employment history dates
- Dates should be in readable format (e.g. "Jan 2020", "2019")
- Do NOT fabricate or infer information that is not present in the text
- Preserve the original language and terminology used in the resume`,

    userPrompt: `Parse this resume and extract structured data:\n\n---\n${truncatedText}\n---`,
  };
}
