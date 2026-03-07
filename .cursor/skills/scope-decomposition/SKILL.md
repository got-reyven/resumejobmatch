---
name: scope-decomposition
description: Decomposes product scope documents into atomic, well-documented task folders with plans, to-dos, and acceptance criteria. Use when breaking down PROJECT-SCOPE.md into tasks, creating new task folders, or turning feature requests into actionable work items.
---

# Scope Decomposition

## When to Use

Invoke this skill when:

- Breaking down `docs/PROJECT-SCOPE.md` into individual tasks
- A new feature request needs to become a documented task
- An existing scope section hasn't been decomposed yet

## Decomposition Workflow

```
Task Progress:
- [ ] Step 1: Read scope and existing tasks
- [ ] Step 2: Identify decomposable scope items
- [ ] Step 3: Define task boundaries
- [ ] Step 4: Create task folders with documentation
- [ ] Step 5: Map dependencies between tasks
```

## Step 1: Read Current State

```
1. Read docs/PROJECT-SCOPE.md (full scope)
2. List docs/tasks/ (existing tasks)
3. For each existing task, read to-do.md to check status
4. Identify scope items that have NO corresponding task folder
```

Never create a task folder that already exists. If a related task exists, update it instead.

## Step 2: Identify Decomposable Items

Scan PROJECT-SCOPE.md for deliverable features. Group by layer:

| Layer         | Priority | Examples                                                   |
| ------------- | -------- | ---------------------------------------------------------- |
| Foundation    | P0       | Project init, database schema, auth setup, CI/CD           |
| Core          | P1       | Resume upload, job input, matching engine, results display |
| User Features | P2       | Dashboard, match history, rate limiting, settings          |
| Monetization  | P3       | Pricing page, payment, tier enforcement                    |
| Polish        | P2–P3    | Landing page design, how-it-works, SEO, i18n setup         |

## Step 3: Define Task Boundaries

Each task must pass the **ATOMIC** test:

| Criterion       | Question                                                | If No...                       |
| --------------- | ------------------------------------------------------- | ------------------------------ |
| **A**tomic      | Does it deliver one testable thing?                     | Split into smaller tasks       |
| **T**rackable   | Can progress be measured in sub-tasks?                  | Add more granularity           |
| **O**wnable     | Can it be assigned to specific agents?                  | Clarify agent responsibilities |
| **M**easurable  | Are there clear acceptance criteria?                    | Define what "done" means       |
| **I**ndependent | Can it be built without unfinished dependencies?        | Map dependencies explicitly    |
| **C**omplete    | Does it include all layers (schema → API → UI → tests)? | Add missing layers             |

### Sizing Guide

| Size | Sub-tasks | Agent Sessions | Example                       |
| ---- | --------- | -------------- | ----------------------------- |
| S    | 3–5       | 1              | Add a settings page           |
| M    | 5–8       | 1–2            | Resume upload with extraction |
| L    | 8–12      | 2–3            | Full matching engine pipeline |

If a task has 12+ sub-tasks, split it into 2 tasks with a clear boundary.

## Step 4: Create Task Documentation

For each new task, create the folder structure:

```
docs/tasks/{task-slug}/
  plan.md
  to-do.md
  history.md
  reports/           (empty directory)
```

### Naming Convention

`{task-slug}` = kebab-case, max 30 chars, descriptive noun-phrase:

| Good              | Bad                                      |
| ----------------- | ---------------------------------------- |
| `project-setup`   | `setup`                                  |
| `resume-upload`   | `upload-feature`                         |
| `matching-engine` | `core-matching-and-scoring-system`       |
| `auth-setup`      | `authentication-and-authorization-setup` |

### plan.md — Write the Plan

```markdown
# Task: [Human-Readable Name]

## Goal

[One sentence: what user value does this deliver?]

## Scope

**In scope:**

- [Specific deliverable 1]
- [Specific deliverable 2]

**Out of scope:**

- [Explicitly excluded items — important to prevent scope creep]

## Approach

[Which agents are involved, in what order, key technical decisions]

## Dependencies

- [task-slug that must be done first, or "None"]

## Acceptance Criteria

- [ ] [Criterion 1 — user-observable or testable]
- [ ] [Criterion 2]
- [ ] [Criterion 3]
```

### Writing Good Acceptance Criteria

Each criterion must be **testable** — someone can verify pass/fail:

```markdown
# Bad (vague)

- [ ] Resume upload works
- [ ] UI looks good

# Good (testable)

- [ ] User can upload a PDF file up to 5MB via drag-and-drop or file picker
- [ ] Uploaded PDF text is extracted and displayed in a preview panel
- [ ] Unsupported file types show a validation error with accepted formats listed
- [ ] Upload progress indicator shows during file processing
```

### to-do.md — Define Sub-Tasks

```markdown
# To-Do: [Task Name]

| #   | Sub-task                | Assigned To       | Status  | Notes                 |
| --- | ----------------------- | ----------------- | ------- | --------------------- |
| 1   | Design database schema  | architect         | pending |                       |
| 2   | Create RLS policies     | security-engineer | pending | Depends on #1         |
| 3   | Create Zod schemas      | api-engineer      | pending | Depends on #1         |
| 4   | Implement service layer | api-engineer      | pending | Depends on #2, #3     |
| 5   | Build API routes        | api-engineer      | pending | Depends on #4         |
| 6   | Build UI components     | ui-ux-engineer    | pending | Depends on #5         |
| 7   | Write tests             | qa-engineer       | pending | Depends on #4, #5, #6 |
```

Always include dependency notes so agents know what to wait for.

### history.md — Initialize

```markdown
# History: [Task Name]

## [Today's Date] — product-manager

- Created task from PROJECT-SCOPE.md Section [X]
- Defined [N] sub-tasks across [N] agents
- Dependencies: [list or "None — can start immediately"]
```

## Step 5: Map Cross-Task Dependencies

After creating all task folders, produce a dependency map:

```markdown
## Task Dependency Map

project-setup ──→ auth-setup ──→ resume-upload ──→ matching-engine
│ │
└──→ rate-limiting │
↓
results-display ──→ match-history
```

Store this in `docs/tasks/BACKLOG.md` (see backlog-prioritization skill).

## Common Decomposition Patterns

### Full-Stack Feature Pattern

```
1. architect    → schema + structure
2. security     → RLS + auth rules
3. api-engineer → Zod + service + routes
4. ai-engineer  → AI integration (if applicable)
5. ui-ux        → components + pages
6. qa-engineer  → tests
7. security     → review
```

### Infrastructure Pattern

```
1. devops       → configuration + pipeline
2. architect    → project structure
3. security     → env vars + secrets setup
4. qa-engineer  → verify build + smoke tests
```

### AI Feature Pattern

```
1. architect    → data model for AI inputs/outputs
2. ai-engineer  → prompts + provider + caching
3. api-engineer → API routes wrapping AI service
4. ui-ux        → loading states + results display
5. qa-engineer  → tests with mocked AI
```
