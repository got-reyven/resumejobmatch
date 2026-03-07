# Resume Job Match — Project Scope

**Product**: Resume Job Match
**URL**: https://resumejobmatch.com
**Tagline**: Know exactly how you match — before you apply.
**Version**: MVP v0.1.0

---

## 1. Product Vision

Resume Job Match is a plug-and-play tool that instantly analyzes how well a resume matches a specific job description. It gives jobseekers actionable insights to improve their chances and gives hiring managers a structured way to evaluate candidates — all without requiring signup.

The core differentiator is **depth of insight**. Most tools give a percentage. We give a breakdown that tells you _why_ and _what to do about it_.

---

## 2. User Personas

### Persona A: Jobseeker (Primary)

- Actively applying to jobs (5–30 applications/week)
- Wants to know if their resume is competitive before hitting "Apply"
- Needs specific guidance on what to fix, not just a score

### Persona B: Hiring Manager / Recruiter (Secondary)

- Reviewing 20–100+ resumes per role
- Wants to quickly identify strong candidates and know where to probe in interviews
- Needs structured evaluation beyond gut feeling

### Persona C: Career Coach / Resume Writer (Future)

- Uses the tool with multiple clients
- Needs batch comparisons and shareable reports
- Willing to pay for unlimited access

---

## 3. Core Feature: Plug-and-Play Matching

The landing page _is_ the product. No onboarding, no dashboard required to get value.

### 3.1 Landing Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Header: Logo | How It Works | Pricing | Sign In             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Hero Section:                                               │
│  "See how well you match — in seconds"                       │
│  Subtitle: Paste a job description + upload your resume.     │
│            Get instant, actionable insights.                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐   ┌─────────────────────┐          │
│  │   YOUR RESUME        │   │   JOB DESCRIPTION    │         │
│  │                      │   │                      │         │
│  │  [Upload Zone]       │   │  [Paste Text Area]   │         │
│  │   PDF, DOCX           │   │   or                 │         │
│  │                      │   │  [Paste Job URL]     │         │
│  │  ✓ auto-detects      │   │  ✓ auto-formats      │         │
│  │    file type          │   │    from URL           │        │
│  └─────────────────────┘   └─────────────────────┘          │
│                                                              │
│              [ 🚀 Start Matching ]                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Social proof | How it works steps | FAQ                     │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Resume Input (Left Column)

| Feature          | Details                                                 |
| ---------------- | ------------------------------------------------------- |
| File upload      | Drag-and-drop or click-to-browse                        |
| Accepted formats | `.pdf`, `.docx` (image OCR deferred to post-MVP)        |
| Auto-detection   | Identify file type by MIME + extension                  |
| Max file size    | 5MB                                                     |
| Text extraction  | PDF → `pdf-parse`, DOCX → `mammoth`                     |
| Validation       | Show clear error for unsupported format or corrupt file |
| Preview          | Show extracted text preview so user can verify accuracy |

### 3.3 Job Description Input (Right Column)

| Feature           | Details                                                                        |
| ----------------- | ------------------------------------------------------------------------------ |
| Text input        | Rich text area supporting formatted paste from job boards                      |
| URL input         | Toggle to "Paste URL" mode — fetch and extract job description from public URL |
| URL extraction    | Server-side fetch → parse HTML → extract main content (heuristic + AI)         |
| Supported sources | Any public URL (LinkedIn public posts, Indeed, company career pages)           |
| Auto-format       | Clean pasted HTML into structured text, preserve key sections                  |
| Min length        | Require at least 50 characters to ensure meaningful analysis                   |

### 3.4 Matching Experience

**While Processing:**

- Progress stepper showing: "Reading resume → Analyzing job → Matching skills → Generating insights"
- Animated highlighting effect — keywords in both columns pulse/highlight as they're being "scanned"
- Estimated time: "Usually takes 10–15 seconds"
- Skeleton preview of the results section loading below

**On Completion:**

- Smooth scroll down to results section
- Overall match score prominently displayed with a visual ring/gauge
- Detailed insights expand below (see Section 6)

### 3.5 Rate Limiting (Non-Registered Users)

| Rule            | Value                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Matches per day | 3                                                                                                 |
| Tracking method | IP address + browser fingerprint (fallback)                                                       |
| Reset           | Daily at midnight UTC                                                                             |
| Prompt          | After 3rd match, show "You've used all free matches today. Sign up for more — it's free forever." |
| Storage         | Supabase table `anonymous_usage` with IP hash, count, date                                        |

---

## 4. User Tiers & Pricing

### 4.1 Tier Comparison

| Feature                            | Guest (No Signup) | Free Forever           | One-Time Fee           |
| ---------------------------------- | ----------------- | ---------------------- | ---------------------- |
| Daily matches                      | 3                 | 10                     | Unlimited              |
| Basic insights (score, top gaps)   | ✅                | ✅                     | ✅                     |
| Detailed insights (full breakdown) | Top 3 only        | Top 5 only             | ✅ All insights        |
| Match history                      | ❌                | Last 30 days           | Unlimited              |
| Share results                      | ❌                | Link sharing           | Link + PDF export      |
| Multi-resume comparison            | ❌                | ❌                     | Up to 5 per job        |
| Priority AI processing             | ❌                | ❌                     | ✅                     |
| Bring Your Own API Key             | ❌                | ✅ (unlimited matches) | ✅ (unlimited matches) |
| Custom branding on exports         | ❌                | ❌                     | ❌ (future add-on)     |

### 4.2 Pricing Model

**Free Forever** — $0

- 10 matches/day (resets at midnight UTC)
- Core insights with limited depth
- Match history (30 days retention)
- Email signup required

**Lifetime Access** — $49 one-time fee

- Unlimited matches
- All current and future insights
- Unlimited history
- PDF export and sharing
- Multi-resume comparison
- Priority processing queue

### 4.3 Why One-Time Fee vs. Subscription

- Jobseekers are often budget-conscious and between jobs — a one-time fee removes friction
- Creates goodwill and word-of-mouth ("I paid $49 once and use it forever")
- Upsell path exists later: team plans for recruiters, API access for integrations
- Lower churn risk — no monthly cancel decisions

### 4.4 Credit System

**Decision**: No credit system. Simple daily match counts only. Revisit post-launch if finer monetization granularity is needed.

---

## 5. Registered User Features

### 5.1 Authentication

- Email + password (Supabase Auth)
- Google OAuth (one-click signup — critical for conversion)
- Magic link (passwordless email)
- No email verification wall — let users start immediately, verify later

### 5.2 Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar: Dashboard | History | Settings | [New Match]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Quick Stats:                                                │
│  [12 Matches This Month] [Avg Score: 72%] [Best: 91%]       │
│                                                              │
│  Recent Matches:                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Senior React Dev @ Acme    │ 85% │ 2 hrs ago │ View │   │
│  │ Full Stack Eng @ StartupX  │ 62% │ Yesterday │ View │   │
│  │ Frontend Lead @ BigCo      │ 91% │ 3 days    │ View │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  [+ New Match]                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Match History

- List of all past matches with: job title, company (parsed), score, date
- Search and filter by: date range, score range, keyword
- Re-open any past match to see full insights
- Delete individual matches
- Free tier: 30-day retention, Lifetime: unlimited

### 5.4 Share Results

- Generate a unique shareable link (read-only public page)
- Optional expiry on shared links (24h, 7d, 30d, never)
- Lifetime tier: export as branded PDF report
- Share metadata: match score in social preview card (OG tags)

### 5.5 Multi-Resume Comparison (Lifetime Tier)

- Upload up to 5 resumes against the same job description
- Side-by-side comparison table:
  - Overall score per resume
  - Skills coverage per resume
  - Strengths/weaknesses comparison
  - "Best resume for this job" recommendation
- Use case: different resume versions tailored for different roles

### 5.6 Bring Your Own API Key (Free + Lifetime)

Registered users can connect their own LLM API key to unlock provider choice and unlimited AI-powered matches.

#### Settings UI

```
┌──────────────────────────────────────────────────────────┐
│  Settings > AI Provider                                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  AI Provider:  [ OpenAI ▾ ]                               │
│                                                           │
│  API Key:      [ sk-•••••••••••••••7xQ2 ]  [✓ Valid]     │
│                                                           │
│  Model:        [ gpt-4o-mini ▾ ]                          │
│                                                           │
│  [ Test Connection ]   [ Remove Key ]                     │
│                                                           │
│  ℹ Your key is encrypted and used only for your matches.  │
│    We never store it in plaintext or share it.             │
│                                                           │
│  Benefits of using your own key:                          │
│  • Unlimited matches (no daily cap)                       │
│  • Choose your preferred AI provider and model            │
│  • Billed directly to your provider account               │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

#### Supported Providers

| Provider  | Available Models                  | Best For                       |
| --------- | --------------------------------- | ------------------------------ |
| OpenAI    | gpt-4o, gpt-4o-mini, gpt-4-turbo  | Best structured output support |
| Anthropic | claude-3.5-sonnet, claude-3-haiku | Nuanced language analysis      |
| Google    | gemini-1.5-pro, gemini-1.5-flash  | Cost-effective high volume     |

#### Rules

| Rule                | Details                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| Availability        | Free and Lifetime registered users                                                                          |
| Keys per provider   | 1 per user per provider                                                                                     |
| Validation          | Lightweight test call on save; reject invalid keys                                                          |
| Storage             | AES-256-GCM encrypted at rest in `user_api_keys` table                                                      |
| Display             | Masked on client (e.g., `sk-...7xQ2`); never returned in full                                               |
| Rate limit override | Users with valid BYOAK key: unlimited matches (hard cap at 1000/day for abuse prevention)                   |
| Fallback            | If user's key fails at call time, show error + prompt to check key — never silently fall back to system key |
| Deletion            | Removing key reverts user to system defaults and standard rate limits                                       |

---

## 6. Insights Engine (Core Differentiator)

This is where we win. Each insight is a standalone module — we build one at a time, ship incrementally, and there's no limit to what we can add.

### 6.1 Results UI: Tabbed Insights

Results are displayed in a tabbed layout — no role selection before matching. The user runs one match and sees insights organized by perspective:

```
┌──────────────────────────────────────────────────────┐
│  Overall Match Score: 78%  [ring gauge]              │
├──────────────────────────────────────────────────────┤
│  [ For Jobseekers ]  [ For Hiring Managers ]         │
│  ─────────────────────────────────────────           │
│  (tab content renders below)                         │
└──────────────────────────────────────────────────────┘
```

- Some insights appear in **both** tabs (shared data, framed per audience)
- Some are **exclusive** to one tab
- This maximizes value from a single match while serving both personas

### 6.2 Insight Catalog

Each insight is tagged: **Shared** (both tabs), **Jobseeker** (JS tab only), or **Hiring Manager** (HM tab only).

#### Tier 1 — Always Available (Guest + Free + Lifetime)

| #   | Insight                    | Tab            | Description                                                                                                                                                                                                                     |
| --- | -------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Overall Match Score**    | Shared         | Percentage score based on weighted skill, experience, and qualification overlap. Displayed as a ring gauge (0–100%). Framed as "You match X%" for jobseekers and "This candidate meets X% of requirements" for hiring managers. |
| 2   | **Skills Match Breakdown** | Shared         | Two lists: "Matched Skills" and "Missing Skills". Color-coded green/red. Jobseekers see "skills to add"; hiring managers see "requirements coverage".                                                                           |
| 3   | **Top 3 Action Items**     | Jobseeker      | AI-generated prioritized list: the 3 most impactful changes to improve match score. E.g., "Add 'Kubernetes' to your skills section — it's a key requirement."                                                                   |
| 4   | **Top Strengths**          | Hiring Manager | Top 3 areas where the candidate exceeds or strongly meets requirements.                                                                                                                                                         |

#### Tier 2 — Free (Limited) + Lifetime (Full)

| #   | Insight                          | Tab            | Description                                                                                                                                                                                                         |
| --- | -------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5   | **ATS Keyword Analysis**         | Jobseeker      | Critical keywords from the job description: present vs. missing in resume. Highlights exact matches vs. semantic matches (e.g., "JS" ≈ "JavaScript"). Actionable: "Add these 5 keywords to increase ATS pass rate." |
| 6   | **Experience Alignment**         | Shared         | Maps candidate's roles to job requirements. Shows: years of relevant experience, seniority fit, industry alignment. Jobseekers see improvement tips; hiring managers see relevance scores per role.                 |
| 7   | **Qualification Fit**            | Shared         | Maps required/preferred qualifications (degree, certifications, clearances) to resume. Flags: "Met", "Partially met", "Not found". Both audiences benefit.                                                          |
| 8   | **Resume Section Strength**      | Jobseeker      | Rates each resume section (summary, skills, experience, education) on how well it serves _this specific job_. Highlights weakest section with improvement suggestions.                                              |
| 9   | **Tailored Summary Suggestion**  | Jobseeker      | AI-generates a rewritten professional summary optimized for the specific job description. Copy-paste ready.                                                                                                         |
| 10  | **Risk Areas & Gaps**            | Hiring Manager | Where the candidate falls short. Framed constructively: "Candidate shows no cloud infrastructure experience — assess transferability from their DevOps background."                                                 |
| 11  | **Interview Focus Points**       | Hiring Manager | AI-generated questions tailored to probe the specific gaps identified. E.g., "Ask about their experience scaling systems — the resume shows small-team environments."                                               |
| 12  | **Overqualification Assessment** | Hiring Manager | Flags if the candidate appears significantly overqualified. Includes context: "Senior-level experience applying for mid-level role — verify expectations."                                                          |

#### Tier 3 — Lifetime Only

| #   | Insight                                | Tab            | Description                                                                                                                                                                                              |
| --- | -------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13  | **Rewrite Suggestions**                | Jobseeker      | Bullet-by-bullet AI suggestions to rephrase experience items using the job's language and power verbs. Before/after comparison.                                                                          |
| 14  | **Competitive Positioning**            | Jobseeker      | Estimates how the candidate stacks up: "Your profile matches approximately the top 30% of typical applicants for this role" (based on requirement coverage, not actual applicant data).                  |
| 15  | **Industry Jargon Check**              | Jobseeker      | Industry-specific terminology the resume should use but doesn't. E.g., for fintech: "Consider terms like 'regulatory compliance', 'KYC/AML'."                                                            |
| 16  | **Soft Skills Alignment**              | Shared         | Extracts soft skill requirements (leadership, collaboration, communication) and checks if the resume demonstrates them. Jobseekers get improvement tips; hiring managers get a soft skills coverage map. |
| 17  | **Career Gap Analysis**                | Shared         | Identifies employment timeline gaps. Jobseekers get suggestions on how to address them; hiring managers get flagged gaps with context for interview discussion.                                          |
| 18  | **Cover Letter Starter**               | Jobseeker      | AI-generates a tailored cover letter opening paragraph based on the match analysis, highlighting strongest alignment points.                                                                             |
| 19  | **Skill Transferability Map**          | Hiring Manager | For skills the candidate lacks but has adjacent experience in. E.g., "No React experience, but strong Angular background — high transferability."                                                        |
| 20  | **Culture & Communication Indicators** | Hiring Manager | Analyzes resume writing style for indicators: collaborative language, leadership framing, technical depth. Language pattern analysis, not a personality test.                                            |
| 21  | **Comparison Matrix**                  | Hiring Manager | When multiple resumes are matched against the same job, side-by-side ranking with per-requirement scores. Highlights strongest candidate per category.                                                   |
| 22  | **Salary Range Indicator**             | Hiring Manager | Market-informed salary range estimate based on experience level, skills, and seniority. (Requires public salary data integration — future phase.)                                                        |
| 23  | **Structured Evaluation Report**       | Hiring Manager | Exportable PDF with all insights formatted as a professional evaluation document for hiring committees.                                                                                                  |

### 6.3 Tab Summary

| Tab                 | Tier 1     | Tier 2            | Tier 3                      | Total  |
| ------------------- | ---------- | ----------------- | --------------------------- | ------ |
| Shared (both tabs)  | 2 (#1, #2) | 2 (#6, #7)        | 2 (#16, #17)                | 6      |
| Jobseeker only      | 1 (#3)     | 3 (#5, #8, #9)    | 4 (#13, #14, #15, #18)      | 8      |
| Hiring Manager only | 1 (#4)     | 3 (#10, #11, #12) | 5 (#19, #20, #21, #22, #23) | 9      |
| **Total**           | **4**      | **8**             | **11**                      | **23** |

### 6.4 Insight Build Priority

Build insights in this order — each delivers standalone value:

| Phase     | Insights to Build                                                                                     | Rationale                                                    |
| --------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **MVP**   | #1 Overall Score (Shared), #2 Skills Breakdown (Shared), #3 Top 3 Actions (JS), #4 Top Strengths (HM) | Core value prop for both tabs — validates product-market fit |
| **v0.2**  | #5 ATS Keywords (JS), #6 Experience Alignment (Shared), #7 Qualification Fit (Shared)                 | High-demand jobseeker feature + deepens shared insights      |
| **v0.3**  | #8 Section Strength (JS), #9 Tailored Summary (JS), #10 Risk Areas (HM), #11 Interview Questions (HM) | Makes both tabs actionable beyond scoring                    |
| **v0.4**  | #12 Overqualification (HM), #13 Rewrite Suggestions (JS), #16 Soft Skills (Shared)                    | Drives Lifetime conversion with premium-feel insights        |
| **v0.5+** | Remaining Tier 3 insights, one at a time                                                              | Data-driven prioritization based on user engagement          |

---

## 7. Technical Approach

### 7.1 Resume Processing Pipeline

```
Upload → File Type Detection → Text Extraction → AI Structured Parsing → Store
                                                                           ↓
Job Description → Text Input / URL Fetch → AI Structured Parsing ────→ Matching Engine
                                                                           ↓
                                                                    Insight Generation
                                                                           ↓
                                                                     Results Display
```

| Step               | Approach                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| File detection     | MIME type + extension check                                                                       |
| PDF extraction     | `pdf-parse` (server-side)                                                                         |
| DOCX extraction    | `mammoth` (server-side)                                                                           |
| Image OCR          | Deferred to post-MVP                                                                              |
| Job URL extraction | AI-powered: pass public URL to ChatGPT API to read and extract structured job description content |
| Job text input     | Direct paste, cleaned and structured                                                              |
| Resume parsing     | AI structured output → Zod-validated `ParsedResume` schema                                        |
| Job parsing        | AI structured output → Zod-validated `ParsedJob` schema                                           |
| Matching           | AI-powered comparison with structured scoring schema                                              |
| Insight generation | Per-insight AI calls with cached results                                                          |

### 7.2 Data Model (High Level)

```
users (Supabase Auth)
  ├── resumes (uploaded files + parsed data)
  ├── matches (resume + job + score + insights)
  │     ├── match_insights (individual insight results)
  │     └── shared_links (public sharing tokens)
  ├── job_descriptions (parsed job data)
  ├── usage_tracking (daily match counts)
  └── user_api_keys (encrypted BYOAK keys per provider)

anonymous_usage (IP-based rate limiting for guests)
ai_cache (cached AI responses by input hash)
```

#### `user_api_keys` Table

| Column              | Type                     | Description                             |
| ------------------- | ------------------------ | --------------------------------------- |
| `id`                | `uuid` (PK)              | Primary key                             |
| `user_id`           | `uuid` (FK → auth.users) | Owner, RLS-scoped                       |
| `provider`          | `text`                   | `openai`, `anthropic`, `google`         |
| `encrypted_key`     | `text`                   | AES-256-GCM ciphertext (base64)         |
| `iv`                | `text`                   | Initialization vector (base64)          |
| `auth_tag`          | `text`                   | GCM authentication tag (base64)         |
| `key_hint`          | `text`                   | Last 4 chars for display (e.g., `7xQ2`) |
| `preferred_model`   | `text`                   | User's selected model for this provider |
| `is_valid`          | `boolean`                | Last validation result                  |
| `last_validated_at` | `timestamptz`            | When the key was last tested            |
| `created_at`        | `timestamptz`            | Default `now()`                         |
| `updated_at`        | `timestamptz`            | Trigger-maintained                      |

- **Unique constraint**: `(user_id, provider)` — one key per provider per user
- **RLS**: `auth.uid() = user_id` on all operations
- **ON DELETE CASCADE** from `auth.users`

### 7.3 Key Technical Decisions

| Decision                        | Choice                              | Rationale                                                                                                                             |
| ------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| AI for matching vs. algorithmic | AI-primary with keyword fallback    | Semantic understanding is the differentiator; keyword matching alone can't assess transferability or context                          |
| One AI call vs. pipeline        | Pipeline (parse → match → insights) | Smaller focused calls are cheaper, cacheable, and more reliable than one mega-prompt                                                  |
| Real-time vs. async processing  | Real-time with progress streaming   | Matches should complete in 10–20s; async queue only for batch comparison                                                              |
| Guest rate limiting             | IP hash in DB (not Redis)           | Free tier — Supabase is sufficient; add Redis/Upstash only if abuse becomes an issue                                                  |
| Payment processor               | Lemon Squeezy                       | One-time $49 payment, no subscription complexity; handles tax automatically for global sales                                          |
| Job URL extraction              | ChatGPT API (browsing)              | Pass public URL directly to ChatGPT to read and extract content — reliable for public job postings, no scraping infrastructure needed |
| BYOAK API key storage           | AES-256-GCM encryption at rest      | User API keys are credentials — never stored plaintext; decrypted only in-memory at call time                                         |
| BYOAK provider support          | OpenAI, Anthropic, Google           | Three major providers cover most user preferences; extensible via `AIProvider` interface                                              |

---

## 8. Pages & Routes

| Route                   | Page                            | Auth                                         |
| ----------------------- | ------------------------------- | -------------------------------------------- |
| `/`                     | Landing page with matching tool | Public                                       |
| `/results/[id]`         | Match results view              | Public (with sharing token) or authenticated |
| `/auth/login`           | Sign in                         | Public                                       |
| `/auth/signup`          | Sign up                         | Public                                       |
| `/dashboard`            | User dashboard                  | Required                                     |
| `/dashboard/history`    | Match history list              | Required                                     |
| `/dashboard/match/[id]` | Detailed match view             | Required                                     |
| `/dashboard/compare`    | Multi-resume comparison         | Required (Lifetime)                          |
| `/dashboard/settings`   | Account settings                | Required                                     |
| `/pricing`              | Plan comparison                 | Public                                       |
| `/how-it-works`         | Explainer page                  | Public                                       |
| `/shared/[token]`       | Shared results (read-only)      | Public                                       |

---

## 9. MVP Scope (v0.1.0)

### In Scope

- [x] Landing page with matching tool (resume upload + job description paste/URL)
- [x] PDF and DOCX text extraction
- [x] Job description via paste or public URL (ChatGPT-powered extraction)
- [x] AI-powered resume and job description parsing
- [x] AI-powered matching with overall score
- [x] 4 core insights: Match Score, Skills Breakdown (Shared), Top 3 Actions (JS), Top Strengths (HM)
- [x] Tabbed results view: "For Jobseekers" and "For Hiring Managers"
- [x] Guest rate limiting (3/day)
- [x] Email + Google OAuth authentication
- [x] Free tier with 10 matches/day
- [x] Basic match history (last 30 days)
- [x] Responsive design (mobile + desktop)
- [x] i18n-ready structure (English first)

### Deferred to Post-MVP

- [ ] Image/OCR resume processing
- [ ] One-time payment integration ($49 Lifetime via Lemon Squeezy)
- [ ] Lifetime tier features (comparison, PDF export, sharing)
- [ ] Advanced insights (Tier 2 and 3)
- [ ] BYOAK: Bring Your Own API Key (provider selection + encrypted key storage)
- [ ] API access for third-party integrations

---

## 10. Success Metrics

| Metric                          | Target (First 90 Days)         |
| ------------------------------- | ------------------------------ |
| Landing page → match started    | > 40% conversion               |
| Match started → match completed | > 90% (reliability)            |
| Guest → signup conversion       | > 15%                          |
| Free → Lifetime conversion      | > 5%                           |
| Daily active matches            | 100+                           |
| Average match satisfaction      | > 4/5 (future feedback widget) |

---

## 11. Resolved Decisions

| #   | Question                      | Decision                                          | Rationale                                                                                                                                                  |
| --- | ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Lifetime pricing              | **$49** one-time fee                              | Premium positioning; room to discount for early adopters or promos                                                                                         |
| 2   | Image OCR                     | **Post-MVP**                                      | Adds complexity (OCR pipeline, accuracy issues); PDF + DOCX covers 95% of resumes                                                                          |
| 3   | Job URL extraction            | **MVP** — via ChatGPT API                         | ChatGPT can read public URLs natively; no scraping infra needed; works reliably with public job postings                                                   |
| 4   | Hiring manager mode           | **No pre-match toggle** — tabbed results instead  | Single matching flow for everyone; results page has "For Jobseekers" and "For Hiring Managers" tabs; insights are tagged as Shared, JS-only, or HM-only    |
| 5   | Credit system                 | **No** — simple daily match limits                | Match counts are easier to understand; credits add UX friction; revisit only if monetization needs finer control                                           |
| 6   | BYOAK strategy                | **Post-MVP** — encrypted key storage, 3 providers | Users bring their own OpenAI/Anthropic/Google key for unlimited matches; AES-256-GCM encryption at rest; never silently fall back to system key on failure |
| 7   | BYOAK fallback on key failure | **Show error, don't fall back**                   | Silent fallback to system key would consume platform credits without user awareness; explicit error + prompt to fix key is safer                           |
