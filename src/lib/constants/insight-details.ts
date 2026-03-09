interface InsightDetail {
  why: string;
  implementation: string;
  interpret?: string;
}

export const insightDetails: Record<number, InsightDetail> = {
  1: {
    why: "The anchor metric. Jobseekers get a fast read on competitiveness. Hiring managers get a structured first-pass filter. This is the number users remember and share.",
    implementation:
      "We compare your parsed resume against parsed job requirements using a weighted scoring model across 4 dimensions: skills (40%), experience (30%), qualifications (20%), and overall fit (10%). A single analysis call returns dimension scores and an overall percentage. The score is 0–100, displayed as a ring gauge.",
    interpret:
      "80–100%: Strong match — resume closely aligns with requirements.\n60–79%: Moderate match — clear alignment with notable gaps.\n40–59%: Weak match — some transferable skills but significant gaps.\n0–39%: Poor match — role requires substantially different background.",
  },
  2: {
    why: "The most actionable insight for jobseekers — they see exactly which skills to add. Hiring managers see requirements coverage at a glance, enabling faster screening.",
    implementation:
      'We extract skills from the job description (required vs. preferred) and cross-reference them with skills parsed from your resume. Each skill is categorized as: exact match, semantic match (e.g., "JS" ≈ "JavaScript"), or missing.',
    interpret:
      'Green list = skills the candidate has (matched).\nRed list = skills the job needs but the resume lacks (missing).\nSemantic matches are shown with "≈" notation to clarify non-exact wording.',
  },
  3: {
    why: "Turns analysis into action. Jobseekers don't just want to know what's wrong — they want to know what to do first. This is the \"so what?\" that competitors miss. Drives repeat usage and upgrades.",
    implementation:
      "We analyze the gap between your resume and job requirements, then generate 3 prioritized, specific recommendations ranked by impact on your match score. Each action item references a specific resume section and suggests concrete wording.",
    interpret:
      'Actions are ordered by impact — action #1 moves the score the most.\nEach action targets a specific resume section for easy editing.\n"High impact" = directly addresses a required skill or qualification.',
  },
  4: {
    why: 'Gives hiring managers a quick "why consider this candidate" summary. Saves time during high-volume screening by surfacing the best reasons to interview.',
    implementation:
      "We identify the top 3 areas where the candidate strongly meets or exceeds requirements. Each strength is backed by specific evidence from the resume and considers both explicit matches and inferred strengths (e.g., leadership from titles).",
    interpret:
      "Each strength links a job requirement to resume evidence.\nStrengths are ranked by relevance to the role's most critical needs.",
  },
  5: {
    why: "Most large companies use Applicant Tracking Systems that filter resumes by keyword match before a human ever sees them. This insight helps jobseekers pass the automated filter — a critical first hurdle.",
    implementation:
      'We extract critical keywords and phrases from the job description, then check your resume for exact matches, partial matches, and semantic equivalents. Keywords are categorized by type: technical skills, tools, certifications, and soft skills. We also provide an estimated "ATS pass likelihood" based on keyword coverage.',
    interpret:
      "High ATS likelihood: Most critical keywords present — likely to pass automated screening.\nMedium: Some gaps — adding 2-3 keywords could make the difference.\nLow: Major keyword gaps — resume needs significant tailoring for this role.",
  },
  6: {
    why: "Skills alone don't tell the full story. This maps actual work history to the role's expectations — years of experience, seniority level, and industry relevance. Helps both users understand \"fit\" beyond keywords.",
    implementation:
      "We map each of your resume roles to the job requirements. We assess years of relevant experience, seniority match, and industry overlap. Experience is classified as directly relevant, transferable, or unrelated. We compare required years to actual years in relevant domains.",
  },
  7: {
    why: "Many roles have hard qualification requirements (degrees, certifications, clearances). This gives a clear pass/fail view so jobseekers know if they meet the bar, and hiring managers can quickly filter.",
    implementation:
      'We extract required and preferred qualifications from the job description and map each to your resume\'s education, certifications, and credentials. Each qualification is flagged as: "Met", "Partially met", or "Not found".',
    interpret:
      'Met: Resume clearly demonstrates this qualification.\nPartially met: Related but not exact (e.g., "BS in Math" for a "BS in CS" requirement).\nNot found: No evidence in resume — you may still have it but should add it.',
  },
  8: {
    why: "Jobseekers often don't know which part of their resume is letting them down. This rates each section against the specific job, pointing them to where editing effort has the most ROI.",
    implementation:
      "We evaluate each resume section (summary, skills, experience, education, certifications) against the job description. Each section gets a score from 1–5 for relevance to the specific role. We identify the weakest section and provide targeted improvement suggestions.",
  },
  9: {
    why: "The professional summary is the first thing recruiters read and the easiest section to tailor per application. A ready-to-use rewrite removes friction and directly improves match rate. High perceived value drives Pro conversions.",
    implementation:
      "We generate a complete professional summary (3–4 sentences) optimized for the specific job. It incorporates matched skills, relevant experience, and job-specific language. We provide a before/after comparison showing the current vs. suggested summary.",
  },
  10: {
    why: "Saves interview time by pre-identifying areas to probe. Framed constructively — not as disqualifiers but as areas needing clarification. Helps hiring managers ask better questions and make informed decisions.",
    implementation:
      "We identify areas where the candidate falls short of requirements and frame each gap constructively with context and transferability assessment. We suggest what to look for if the candidate has adjacent experience.",
  },
  11: {
    why: "Turns gap analysis into interview strategy. Instead of generic behavioral questions, hiring managers get questions tailored to this specific candidate's profile against this specific role. Significantly improves interview quality.",
    implementation:
      "We generate questions based on identified gaps and ambiguous areas. Each question targets a specific concern with context on what to listen for. Questions are categorized: technical verification, experience depth, and culture fit.",
  },
  12: {
    why: "Overqualified candidates can be flight risks or salary mismatches. This flags the situation early so hiring managers can set appropriate expectations during interviews, reducing costly mis-hires.",
    implementation:
      "We compare candidate seniority, years of experience, and skill depth against the role's level. Significant overqualification is flagged with context. The analysis only triggers when the gap is meaningful — avoiding false positives.",
  },
  13: {
    why: 'Goes beyond "what to change" to "here\'s the exact wording." Bullet-by-bullet rewrites using the job\'s language and power verbs. The highest-effort insight but also the highest perceived value — a key Pro conversion driver.',
    implementation:
      "We rewrite individual experience bullets to better match the job description using action verbs and terminology from the job posting. We show before/after for each suggestion, limited to the 5 most impactful bullet rewrites.",
  },
  14: {
    why: 'Answers the ultimate jobseeker question: "Am I competitive for this role?" Based on requirement coverage analysis (not real applicant data), it gives a directional estimate that helps candidates decide whether to apply or keep tailoring.',
    implementation:
      "We estimate your percentile positioning based on how completely your resume covers the stated requirements. Requirement coverage depth and specificity are used as signals. Explicitly framed as an estimate, not based on actual applicant pool data.",
  },
  15: {
    why: "Every industry has its own vocabulary. Using the right terms signals insider knowledge and cultural fit. Particularly valuable for career changers entering a new industry.",
    implementation:
      "We identify industry-specific terminology from the job description and check which terms are present or absent in your resume. We suggest natural ways to incorporate missing jargon.",
  },
  16: {
    why: "Technical skills get candidates past the screen — soft skills get them hired. This extracts soft skill requirements and checks if the resume demonstrates them through language and accomplishments, not just listing them.",
    implementation:
      "We extract soft skill requirements from the job description (leadership, collaboration, communication, etc.) and analyze your resume for evidence through action verbs and achievement descriptions. We score evidence strength rather than simple keyword presence.",
  },
  17: {
    why: "Employment gaps are the #1 concern hiring managers flag during screening. For jobseekers, knowing how gaps are perceived helps them address concerns proactively. For hiring managers, structured gap context enables fair evaluation.",
    implementation:
      "We analyze your employment timeline from parsed experience dates and identify gaps longer than 3 months. We provide context where inferable (education, freelance indicators).",
  },
  18: {
    why: "Many jobs still require cover letters, and most candidates dread writing them. A tailored opening paragraph based on the match analysis removes the blank-page problem and ensures the letter highlights the strongest alignment points.",
    implementation:
      "We generate an opening paragraph (3–4 sentences) tailored to the specific job that highlights your strongest match areas from the analysis. It maintains a professional but personable tone — ready to copy-paste and extend.",
  },
  19: {
    why: "The best candidates aren't always exact-match candidates. This insight helps hiring managers see potential in adjacent experience — e.g., an Angular expert can likely learn React quickly. Reduces false negatives in screening.",
    implementation:
      "We identify skills the candidate lacks but has adjacent experience in. We rate transferability based on technology proximity, conceptual overlap, and learning curve, providing context for each transfer potential.",
  },
  20: {
    why: "Resume writing style reveals communication patterns. Collaborative language, leadership framing, and technical depth in descriptions signal working style. Not a personality test — a language pattern analysis that gives hiring managers additional signal.",
    implementation:
      'We analyze resume writing patterns across dimensions: collaborative vs. individual, leadership vs. execution, detail-oriented vs. big-picture. Based purely on language analysis of the resume text. Explicitly disclaimed as "indicators from writing style, not a personality assessment."',
  },
  21: {
    why: "When evaluating multiple candidates, side-by-side comparison saves hours. Per-requirement scoring across candidates reveals who's strongest where — essential for shortlisting.",
    implementation:
      "We aggregate match results from multiple resumes matched against the same job and build a comparison table with per-requirement scores. The strongest candidate per category and overall is highlighted. Requires the multi-resume comparison feature (Pro tier).",
  },
  22: {
    why: "Helps hiring managers set realistic compensation expectations based on the candidate's experience level and skill set. Reduces offer-rejection rates from misaligned expectations.",
    implementation:
      "We estimate a salary range based on experience level, skills, seniority, and industry signals from the resume and job description. Framed as a market-informed estimate, not a precise figure.",
  },
  23: {
    why: "Hiring committees need shareable documentation. An exportable PDF with all insights formatted as a professional evaluation document saves hours of write-up time and standardizes the evaluation process across reviewers.",
    implementation:
      "We aggregate all computed insights into a structured PDF document using a professional template with sections, scores, and evidence. Includes: executive summary, score breakdown, strengths, risks, and interview recommendations.",
  },
};
