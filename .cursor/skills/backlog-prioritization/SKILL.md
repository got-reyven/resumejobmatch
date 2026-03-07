---
name: backlog-prioritization
description: Prioritizes and sequences the task backlog using dependency mapping, impact/effort analysis, and MVP scope boundaries. Use when ordering tasks, resolving priority conflicts, managing scope changes, or producing the master backlog document.
---

# Backlog Prioritization

## When to Use

Invoke this skill when:

- Ordering tasks after a decomposition session
- Deciding what to work on next
- A new request conflicts with existing priorities
- Scope changes require re-prioritization
- Producing or updating `docs/tasks/BACKLOG.md`

## Prioritization Workflow

```
Task Progress:
- [ ] Step 1: Inventory all tasks and their status
- [ ] Step 2: Map dependencies
- [ ] Step 3: Score each task
- [ ] Step 4: Sequence the backlog
- [ ] Step 5: Write/update BACKLOG.md
```

## Step 1: Inventory Tasks

Read every `docs/tasks/{slug}/to-do.md` and collect:

| Task          | Size | Priority | Status  | Dependencies  | Blocked By |
| ------------- | ---- | -------- | ------- | ------------- | ---------- |
| project-setup | M    | P0       | pending | None          | —          |
| auth-setup    | M    | P0       | pending | project-setup | —          |

Status roll-up:

- **pending** — no sub-tasks started
- **in-progress** — at least one sub-task in-progress
- **blocked** — waiting on a dependency
- **done** — all sub-tasks and acceptance criteria complete

## Step 2: Map Dependencies

Build a directed acyclic graph (DAG) of task dependencies:

```
Level 0 (no deps):     project-setup
Level 1:               auth-setup, database-schema
Level 2:               resume-upload, job-input, rate-limiting
Level 3:               matching-engine
Level 4:               results-display, insights-engine
Level 5:               match-history, landing-page-polish
```

Tasks at the same level can run in parallel. A task can only start when all its dependencies are `done`.

## Step 3: Score Each Task

Use the **ICE framework** (Impact, Confidence, Ease):

| Factor         | Score 1–5                                              | Question                                 |
| -------------- | ------------------------------------------------------ | ---------------------------------------- |
| **Impact**     | How much does this move the product toward MVP launch? | 5 = blocks launch, 1 = nice polish       |
| **Confidence** | How sure are we about the approach?                    | 5 = clear path, 1 = significant unknowns |
| **Ease**       | How quickly can agents deliver this?                   | 5 = small/simple, 1 = large/complex      |

**ICE Score** = Impact × Confidence × Ease (max 125)

### Priority Mapping

| Priority | ICE Range | Meaning                        |
| -------- | --------- | ------------------------------ |
| P0       | 80–125    | Blocks everything — do first   |
| P1       | 50–79     | Core MVP — do next             |
| P2       | 25–49     | MVP completion — schedule soon |
| P3       | 1–24      | Post-MVP — backlog for later   |

### MVP Scope Gate

Before scoring, check `docs/PROJECT-SCOPE.md` Section 9 (MVP Scope):

- Items in "In Scope" → eligible for P0–P2
- Items in "Deferred to Post-MVP" → automatically P3, no exceptions

## Step 4: Sequence the Backlog

Order tasks by: **dependency level first**, then **ICE score within each level**.

```markdown
## Execution Order

### Wave 1 (Foundation — no dependencies)

1. project-setup (P0, ICE: 125)

### Wave 2 (Requires Wave 1)

2. auth-setup (P0, ICE: 100)
3. database-schema (P0, ICE: 100)

### Wave 3 (Requires Wave 2) — can parallelize

4. resume-upload (P1, ICE: 75)
5. job-input (P1, ICE: 70)
6. rate-limiting (P2, ICE: 45)

### Wave 4 (Requires Wave 3)

7. matching-engine (P1, ICE: 60)

### Wave 5 (Requires Wave 4) — can parallelize

8. results-display (P1, ICE: 65)
9. insights-engine (P1, ICE: 55)
```

**Parallelization rule**: Tasks at the same wave level with no mutual dependencies can be assigned to different agents simultaneously.

## Step 5: Write BACKLOG.md

Maintain a master backlog file at `docs/tasks/BACKLOG.md`:

```markdown
# Task Backlog — Resume Job Match

**Last updated**: [Date]
**MVP target**: v0.1.0

## Execution Order

| Wave | Task            | Priority | ICE | Size | Status  | Dependencies  |
| ---- | --------------- | -------- | --- | ---- | ------- | ------------- |
| 1    | project-setup   | P0       | 125 | M    | pending | None          |
| 2    | auth-setup      | P0       | 100 | M    | pending | project-setup |
| 2    | database-schema | P0       | 100 | M    | pending | project-setup |
| 3    | resume-upload   | P1       | 75  | M    | pending | auth, schema  |
| 3    | job-input       | P1       | 70  | M    | pending | auth, schema  |

## Dependency Map

project-setup → auth-setup → resume-upload → matching-engine → results-display
database-schema ↗ insights-engine ↗

## Scope Boundaries

**MVP (P0–P2)**: [count] tasks
**Post-MVP (P3)**: [count] tasks — do not start until MVP ships

## Next Up

[Top 1–3 tasks ready to start based on completed dependencies]
```

## Handling Scope Changes

When new work comes in:

1. **Is it MVP?** — check against PROJECT-SCOPE.md Section 9
2. **Does a task already cover it?** — if yes, update that task's plan.md
3. **Is it truly new?** — create a new task folder via scope-decomposition skill
4. **Where does it fit?** — score with ICE, insert into the backlog at correct wave
5. **Does it displace anything?** — if capacity is limited, explicitly defer the lowest-priority task

### Scope Creep Signals

Flag and push back when:

- A "small addition" would add 3+ sub-tasks to an existing task
- A new request isn't in PROJECT-SCOPE.md and doesn't have clear user value
- "While we're at it..." suggestions that expand scope mid-task
- Features described as "quick win" that touch 4+ files

Response: "This is valuable but out of current scope. I'll add it to the backlog as a P3 post-MVP task."

## Re-Prioritization Triggers

Re-run prioritization when:

- A task is completed and unlocks new work
- A blocker is discovered that changes the dependency graph
- User/stakeholder feedback shifts priorities
- A technical discovery changes effort estimates significantly
