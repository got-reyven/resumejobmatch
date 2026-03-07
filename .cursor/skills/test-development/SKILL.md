---
name: test-development
description: Guides writing tests across unit, integration, and E2E layers using Vitest, Testing Library, and Playwright. Use when writing tests for new features, fixing bugs with regression tests, or setting up test infrastructure.
---

# Test Development

## When to Use

Invoke this skill when:

- Writing tests for a new feature or module
- Adding a regression test for a bug fix
- Setting up test utilities, factories, or fixtures
- Reviewing test coverage gaps

## Test Decision Matrix

| What to Test          | Test Type        | Tool            | Location               |
| --------------------- | ---------------- | --------------- | ---------------------- |
| Pure functions, utils | Unit             | Vitest          | `__tests__/*.test.ts`  |
| Zod schemas           | Unit             | Vitest          | `__tests__/*.test.ts`  |
| Service functions     | Unit/Integration | Vitest          | `__tests__/*.test.ts`  |
| React components      | Integration      | Testing Library | `__tests__/*.test.tsx` |
| API route handlers    | Integration      | Vitest          | `__tests__/*.test.ts`  |
| Critical user flows   | E2E              | Playwright      | `e2e/*.spec.ts`        |

## Unit Test Template

```typescript
// src/services/__tests__/resume-matcher.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { matchResume } from "../resume-matcher";

// Test factories at the top
function buildResume(overrides?: Partial<Resume>): Resume {
  return {
    id: "resume-1",
    skills: ["TypeScript", "React"],
    experience: [],
    ...overrides,
  };
}

function buildJob(overrides?: Partial<Job>): Job {
  return {
    id: "job-1",
    requirements: ["React", "Node.js"],
    ...overrides,
  };
}

describe("matchResume", () => {
  it("returns score > 0 when skills overlap", () => {
    const resume = buildResume({ skills: ["React", "TypeScript"] });
    const job = buildJob({ requirements: ["React", "Node.js"] });

    const result = matchResume(resume, job);

    expect(result.score).toBeGreaterThan(0);
    expect(result.matchedSkills).toContain("React");
  });

  it("returns score of 0 when no skills overlap", () => {
    const resume = buildResume({ skills: ["Python"] });
    const job = buildJob({ requirements: ["Java"] });

    const result = matchResume(resume, job);

    expect(result.score).toBe(0);
    expect(result.matchedSkills).toHaveLength(0);
  });

  it("handles empty skills gracefully", () => {
    const resume = buildResume({ skills: [] });
    const job = buildJob({ requirements: ["React"] });

    const result = matchResume(resume, job);

    expect(result.score).toBe(0);
  });
});
```

## Component Test Template

```typescript
// src/components/features/__tests__/ResumeCard.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ResumeCard } from "../ResumeCard";

const mockResume = {
  id: "1",
  title: "Software Engineer Resume",
  status: "active",
  matchScore: 85,
};

describe("ResumeCard", () => {
  it("renders resume title and score", () => {
    render(<ResumeCard resume={mockResume} />);

    expect(screen.getByText("Software Engineer Resume")).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it("calls onSelect when clicked", async () => {
    const onSelect = vi.fn();
    render(<ResumeCard resume={mockResume} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith("1");
  });

  it("is accessible via keyboard", async () => {
    const onSelect = vi.fn();
    render(<ResumeCard resume={mockResume} onSelect={onSelect} />);

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalled();
  });
});
```

## E2E Test Template

```typescript
// e2e/resume-workflow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Resume Upload Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    // login helper
  });

  test("user uploads a resume and sees parsed skills", async ({ page }) => {
    await page.goto("/dashboard/resumes");
    await page.getByRole("button", { name: /upload/i }).click();

    const fileInput = page.getByLabel(/file/i);
    await fileInput.setInputFiles("e2e/fixtures/sample-resume.pdf");

    await expect(page.getByText(/processing/i)).toBeVisible();
    await expect(page.getByText(/skills extracted/i)).toBeVisible({
      timeout: 30000,
    });
  });
});
```

## Zod Schema Test Template

```typescript
// src/lib/validations/__tests__/resume.test.ts
import { describe, it, expect } from "vitest";
import { createResumeSchema } from "../resume";

describe("createResumeSchema", () => {
  it("accepts valid input", () => {
    const result = createResumeSchema.safeParse({
      title: "My Resume",
      fileUrl: "https://example.com/resume.pdf",
      fileType: "pdf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createResumeSchema.safeParse({
      title: "",
      fileUrl: "https://example.com/resume.pdf",
      fileType: "pdf",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported file type", () => {
    const result = createResumeSchema.safeParse({
      title: "Resume",
      fileUrl: "https://example.com/resume.txt",
      fileType: "txt",
    });
    expect(result.success).toBe(false);
  });
});
```

## Test Factories

Create reusable builders in `src/test-utils/factories.ts`:

```typescript
export function buildResume(overrides?: Partial<Resume>): Resume {
  return {
    id: crypto.randomUUID(),
    title: "Test Resume",
    userId: "user-1",
    status: "active",
    skills: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
```

## Testing Rules

1. **Arrange-Act-Assert** — clear separation in every test
2. **One assertion focus** — test one behavior per `it()` block
3. **Descriptive names** — reads like a specification
4. **No test interdependence** — each test runs in isolation
5. **Mock at boundaries** — mock Supabase client, AI providers, not internal functions
6. **Every bug fix gets a regression test** — prove the bug existed, prove it's fixed
