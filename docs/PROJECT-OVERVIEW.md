# Project Overview — Resume Job Match

**Product**: Resume Job Match
**URL**: https://resumejobmatch.com
**Stack**: Next.js 14+ · TypeScript · Supabase · Tailwind/shadcn · ChatGPT API

Quick orientation for all agents and new sessions. Read this first, then dive into specifics as needed.

---

## Project Structure

```
docs/
  PROJECT-SCOPE.md              ← Product vision, features, insights, MVP scope
  PROJECT-OVERVIEW.md           ← This file — quick orientation map
  tasks/
    BACKLOG.md                  ← Master backlog with waves and priorities
    {task-slug}/                ← Per-task documentation (plan, to-do, history, reports)

.cursor/
  rules/                        ← Standards enforced on every interaction (10 rules)
  agents/                       ← Specialist subagents with domain expertise (10 agents)
  skills/                       ← Execution playbooks for specific workflows (13 skills)

src/                            ← Application source code (Next.js App Router)
```

---

## Rules (10) — `.cursor/rules/`

Standards and constraints. Always active — every agent follows these.

| Rule                            | Governs                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| `general-rules`                 | Task documentation, agent coordination, code review checkpoint        |
| `technical-architecture`        | Stack, project structure, naming conventions, architecture principles |
| `ui-ux-specifications`          | Design system, accessibility, 5 required states, responsive design    |
| `errors-and-debugging`          | AppError hierarchy, error handling, logging, never swallow errors     |
| `testing-and-quality-assurance` | Testing pyramid, quality gates, ESLint + Prettier + strict TS         |
| `api-documentation`             | REST conventions, `/api/v1/`, response envelope, SaaS readiness       |
| `data-handling-and-security`    | Supabase Auth, RLS, input validation, GDPR, secrets management        |
| `git-and-version-control`       | GitHub Flow, conventional commits, PR standards, SemVer               |
| `performance-and-optimization`  | Core Web Vitals targets, bundle budgets, caching layers               |
| `ai-llm-integration-patterns`   | Provider abstraction, cost control, structured output, reliability    |

---

## Agents (10) — `.cursor/agents/`

Domain experts. Each agent reads relevant rules and uses relevant skills.

### Hierarchy

```
product-manager ──→ defines scope, creates tasks, tracks progress
  └── principal-engineer ──→ technical plans, agent delegation, quality gates
        ├── architect ──→ system design, folder structure, data modeling
        ├── ui-ux-engineer ──→ components, layouts, accessibility
        ├── api-engineer ──→ API routes, Zod schemas, service layer
        ├── ai-engineer ──→ LLM integration, prompts, cost control
        ├── security-engineer ──→ auth, RLS, privacy, vulnerability review
        ├── qa-engineer ──→ tests, coverage, quality validation
        ├── devops-engineer ──→ CI/CD, deployment, performance
        └── debugger ──→ root cause analysis, error resolution
```

### Agent → Rule → Skill Mapping

| Agent              | Primary Rules                                         | Primary Skills                                                 |
| ------------------ | ----------------------------------------------------- | -------------------------------------------------------------- |
| product-manager    | general-rules                                         | scope-decomposition, backlog-prioritization, progress-tracking |
| principal-engineer | all rules                                             | delegates to other agents' skills                              |
| architect          | technical-architecture                                | feature-scaffolding, database-schema-design                    |
| ui-ux-engineer     | ui-ux-specifications                                  | component-development, internationalization                    |
| api-engineer       | api-documentation                                     | api-endpoint-development                                       |
| ai-engineer        | ai-llm-integration-patterns                           | ai-feature-development                                         |
| security-engineer  | data-handling-and-security                            | security-audit, database-schema-design                         |
| qa-engineer        | testing-and-quality-assurance                         | test-development                                               |
| devops-engineer    | git-and-version-control, performance-and-optimization | cicd-and-deployment, performance-audit                         |
| debugger           | errors-and-debugging                                  | _(uses error rules directly)_                                  |

---

## Skills (13) — `.cursor/skills/`

Execution playbooks with step-by-step workflows and templates.

| Skill                      | Used By             | Purpose                                      |
| -------------------------- | ------------------- | -------------------------------------------- |
| `scope-decomposition`      | product-manager     | Break scope into atomic task folders         |
| `backlog-prioritization`   | product-manager     | ICE scoring, wave sequencing, BACKLOG.md     |
| `progress-tracking`        | product-manager     | Status reports, blocker identification       |
| `feature-scaffolding`      | architect           | Scaffold new features with correct structure |
| `database-schema-design`   | architect, security | Tables, RLS, migrations, indexing            |
| `component-development`    | ui-ux-engineer      | Build components with all 5 states           |
| `internationalization`     | ui-ux-engineer      | i18n with next-intl, ICU format              |
| `api-endpoint-development` | api-engineer        | End-to-end API route creation                |
| `ai-feature-development`   | ai-engineer         | AI features with provider abstraction        |
| `test-development`         | qa-engineer         | Tests across unit, integration, E2E          |
| `security-audit`           | security-engineer   | OWASP scan, RLS verification                 |
| `cicd-and-deployment`      | devops-engineer     | GitHub Actions, Vercel, releases             |
| `performance-audit`        | devops-engineer     | Web Vitals, bundle, caching review           |

---

## Workflow

```
1. SCOPE        product-manager reads PROJECT-SCOPE.md
                    ↓
2. DECOMPOSE    product-manager creates docs/tasks/{slug}/ with plan, to-do, history
                    ↓
3. PRIORITIZE   product-manager scores tasks (ICE), builds BACKLOG.md with waves
                    ↓
4. PLAN         principal-engineer takes plan.md → adds technical detail → assigns agents
                    ↓
5. EXECUTE      specialist agents implement (schema → API → UI → AI → tests)
                    ↓
6. REVIEW       code review checkpoint: implementer self-reviews, then cross-review
                    ↓
7. VERIFY       qa-engineer validates, security-engineer audits, devops verifies build
                    ↓
8. TRACK        product-manager updates to-do, history, generates progress report
                    ↓
9. NEXT         pick next task from BACKLOG.md → repeat from step 4
```

---

## Key Documents

| Document         | Location                   | Purpose                                                 |
| ---------------- | -------------------------- | ------------------------------------------------------- |
| Project Scope    | `docs/PROJECT-SCOPE.md`    | Full product vision, features, insights, MVP definition |
| Project Overview | `docs/PROJECT-OVERVIEW.md` | This file — orientation map                             |
| Task Backlog     | `docs/tasks/BACKLOG.md`    | Prioritized task list with waves and dependencies       |
| Task Folders     | `docs/tasks/{slug}/`       | Per-task plan, to-do, history, agent reports            |
