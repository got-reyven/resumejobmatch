const MAX_INPUT_LENGTH = 8000;

export function buildResumeParsingPrompt(resumeText: string) {
  const truncatedText = resumeText.slice(0, MAX_INPUT_LENGTH);

  return {
    systemPrompt: `You are an expert resume parser. Extract structured data from the provided resume text.

Rules:
- Extract all identifiable fields as accurately as possible
- If a field cannot be determined from the text, use null
- CONTACT DETAILS are critical: look carefully for the candidate's full name, email address, phone number, and location/city. These are typically at the very top of the resume and may appear on a single line, separated by pipes (|), bullets (•), or spaces. Extract each one even if they are on the same line
- Skills should be individual items (e.g. "TypeScript", "React"), not grouped phrases
- For experience entries, include the role title, company, dates, description, and highlights (achievement bullets)
- key_responsibilities: collect ALL bullet points from sections labeled "Key Responsibilities", "Key Responsibilities & Achievements", "Core Responsibilities", "Areas of Responsibility", or similar — whether they appear as a standalone top-level section OR as subsections within individual experience/role entries. Aggregate responsibilities from ALL roles into this single flat array. Each item should be one concise responsibility statement. If no such labeled sections exist anywhere in the resume, return an empty array
- For education entries, extract start_year and end_year as numbers (e.g. 2018, 2022). If only one year is shown, use it as end_year
- Estimate total_years_experience from the employment history dates
- Dates should be in readable format (e.g. "Jan 2020", "2019")
- Do NOT fabricate or infer information that is not present in the text
- Preserve the original language and terminology used in the resume`,

    userPrompt: `Parse this resume and extract structured data:\n\n---\n${truncatedText}\n---`,
  };
}
