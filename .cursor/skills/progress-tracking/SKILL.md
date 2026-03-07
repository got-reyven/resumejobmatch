---
name: progress-tracking
description: Tracks task progress, generates status reports, identifies blockers, and maintains documentation across all active tasks. Use when reviewing project status, generating progress reports, identifying what to work on next, or checking for stalled tasks.
---

# Progress Tracking

## When to Use

Invoke this skill when:

- Reviewing overall project status
- Generating a progress report
- Identifying blocked or stalled tasks
- Deciding what to work on next
- A stakeholder asks "where are we?"

## Tracking Workflow

```
Task Progress:
- [ ] Step 1: Scan all task folders
- [ ] Step 2: Classify task status
- [ ] Step 3: Identify blockers and risks
- [ ] Step 4: Determine next actions
- [ ] Step 5: Generate progress report
```

## Step 1: Scan All Task Folders

Read every `docs/tasks/{slug}/`:

- `to-do.md` — current sub-task status
- `history.md` — latest activity timestamp
- `plan.md` — acceptance criteria completion
- `reports/` — which agent reports exist

## Step 2: Classify Task Status

For each task, compute status from its `to-do.md`:

| Status          | Condition                                                            |
| --------------- | -------------------------------------------------------------------- |
| **Not started** | All sub-tasks are `pending`                                          |
| **In progress** | At least one sub-task is `in-progress` or `done`, but not all `done` |
| **Blocked**     | Any sub-task is `blocked`, or a dependency task is not `done`        |
| **Done**        | All sub-tasks are `done` AND all acceptance criteria are met         |
| **Stalled**     | In progress but `history.md` has no entry in the last 48 hours       |

### Completion Percentage

```
completion = (sub-tasks with status "done") / (total sub-tasks) × 100
```

## Step 3: Identify Blockers and Risks

### Blocker Types

| Type           | Signal                                                    | Resolution                        |
| -------------- | --------------------------------------------------------- | --------------------------------- |
| **Dependency** | Task waiting on another task that isn't done              | Prioritize the blocking task      |
| **Technical**  | Agent encountered an unresolved issue                     | Delegate to debugger or architect |
| **Scope**      | Acceptance criteria unclear or conflicting                | Clarify in plan.md                |
| **External**   | Waiting on API key, third-party service, or user decision | Flag to stakeholder               |

### Risk Indicators

- Task has been `in-progress` for 3+ agent sessions with < 50% completion
- Multiple tasks blocked by the same dependency
- Agent report flags "Needs follow-up" status
- No history entries for an in-progress task (stalled)

## Step 4: Determine Next Actions

### What's Ready to Start?

A task is ready when:

1. All dependency tasks have status `done`
2. The task itself is `not started` or `blocked` (but blocker is resolved)
3. It has the highest priority among ready tasks (check BACKLOG.md)

### What Needs Attention?

Priority order for action:

1. **Unblock** — resolve blockers on in-progress tasks
2. **Continue** — advance the highest-priority in-progress task
3. **Start** — begin the next ready task from the backlog
4. **Review** — verify completed tasks meet acceptance criteria

## Step 5: Generate Progress Report

### Quick Status (for daily check-ins)

```markdown
## Status: [Date]

**Overall**: [X/Y] MVP tasks complete ([Z]%)

| Status      | Count |
| ----------- | ----- |
| Done        | X     |
| In Progress | X     |
| Blocked     | X     |
| Not Started | X     |

**Next up**: [task-slug] — [reason it's next]
**Blockers**: [task-slug] — [what's blocking and proposed fix]
```

### Full Progress Report (for milestone reviews)

```markdown
## Progress Report: [Date]

### Summary

- **MVP Progress**: [X/Y] tasks complete ([Z]%)
- **Current Wave**: [N] (see BACKLOG.md)
- **Blockers**: [count]
- **Velocity**: [tasks completed in last review period]

### Task Status

| Task          | Priority | Progress   | Status      | Notes                 |
| ------------- | -------- | ---------- | ----------- | --------------------- |
| project-setup | P0       | 5/5 (100%) | done        |                       |
| auth-setup    | P0       | 3/7 (43%)  | in-progress | RLS policies pending  |
| resume-upload | P1       | 0/6 (0%)   | blocked     | Waiting on auth-setup |

### Completed Since Last Review

- **project-setup** — all acceptance criteria verified
  - Key deliverables: [list]

### In Progress

- **auth-setup** — 43% complete
  - Completed: schema, Supabase config, email auth
  - Remaining: Google OAuth, RLS policies, auth middleware, tests
  - ETA: [estimate]

### Blocked

- **resume-upload** — blocked by auth-setup
  - Impact: delays matching-engine (Wave 4)
  - Resolution: prioritize auth-setup completion

### Risks

- [Risk description + mitigation plan]

### Next Actions

1. [Specific action — which agent, which task]
2. [Specific action]
3. [Specific action]
```

### Milestone Tracking

Track MVP completion against scope:

```markdown
## MVP Milestone Tracker

| Scope Item                       | Task                                   | Status      |
| -------------------------------- | -------------------------------------- | ----------- |
| Landing page with matching tool  | landing-page, resume-upload, job-input | 1/3 done    |
| PDF and DOCX text extraction     | resume-upload                          | not started |
| Job description via paste or URL | job-input                              | not started |
| AI-powered matching              | matching-engine                        | not started |
| 4 core insights                  | insights-engine                        | not started |
| Tabbed results view              | results-display                        | not started |
| Guest rate limiting              | rate-limiting                          | not started |
| Auth (email + Google)            | auth-setup                             | in-progress |
| Free tier (10/day)               | rate-limiting                          | not started |
| Match history (30 days)          | match-history                          | not started |
| Responsive design                | [all UI tasks]                         | not started |
| i18n-ready structure             | i18n-setup                             | not started |
```

## Documentation Hygiene

During every tracking session, fix any documentation issues:

- `to-do.md` statuses that don't match `history.md` entries
- Tasks marked `done` without all acceptance criteria checked off
- Missing agent reports for completed sub-tasks
- Stale `BACKLOG.md` that doesn't reflect current state

## Tracking Cadence

| Frequency                   | Action                                                     |
| --------------------------- | ---------------------------------------------------------- |
| Before every task           | Read `to-do.md` of the task and its dependencies           |
| After every task completion | Update `to-do.md`, append `history.md`, write agent report |
| Per work session            | Quick status scan of all active tasks                      |
| Per milestone               | Full progress report with milestone tracker                |
