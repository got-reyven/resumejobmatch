---
name: feature-scaffolding
description: Scaffolds new features with consistent folder structure, module boundaries, and boilerplate following the Resume Job Match architecture. Use when adding a new feature, creating a new page/route, or setting up a new domain module.
---

# Feature Scaffolding

## When to Use

Invoke this skill when:

- Adding a new feature (e.g., resume upload, job matching, user profile)
- Creating a new route or page in the app
- Setting up a new service module or domain area

## Scaffolding Workflow

```
Task Progress:
- [ ] Step 1: Define the feature boundary
- [ ] Step 2: Generate the folder structure
- [ ] Step 3: Create Zod schemas (single source of truth)
- [ ] Step 4: Create service layer
- [ ] Step 5: Create API route(s)
- [ ] Step 6: Create UI components
- [ ] Step 7: Create test stubs
```

## Step 1: Define the Feature Boundary

Answer these before creating any files:

| Question                                | Example Answer                     |
| --------------------------------------- | ---------------------------------- |
| What resource does this feature manage? | `resume`                           |
| What operations are needed?             | create, read, list, update, delete |
| Does it need AI processing?             | Yes — skill extraction             |
| Does it need file storage?              | Yes — PDF/DOCX uploads             |
| What RLS policies are needed?           | Users access only own resumes      |

## Step 2: Feature Folder Structure

```
src/
  app/
    (dashboard)/
      {feature}/
        page.tsx              # Main page (server component)
        loading.tsx           # Skeleton loading state
        error.tsx             # Error boundary
        layout.tsx            # Optional: feature-specific layout
    api/v1/
      {feature}/
        route.ts              # Collection endpoints (GET list, POST create)
        [id]/
          route.ts            # Single resource (GET, PATCH, DELETE)
  components/
    features/
      {feature}/
        {Feature}List.tsx     # List view component
        {Feature}Card.tsx     # Card/item component
        {Feature}Form.tsx     # Create/edit form
        {Feature}Detail.tsx   # Detail view
  services/
    {feature}-service.ts      # Business logic
  lib/
    validations/
      {feature}.ts            # Zod schemas
  hooks/
    use-{feature}.ts          # Client-side hooks (if needed)
  types/
    {feature}.ts              # Types (only if not inferred from Zod)
```

## Step 3: Zod Schemas First

Always start with schemas — they drive types, validation, and API contracts:

```typescript
// src/lib/validations/resume.ts
import { z } from "zod";

export const createResumeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  fileUrl: z.string().url(),
  fileType: z.enum(["pdf", "docx"]),
});

export const updateResumeSchema = createResumeSchema.partial();

export const resumeFiltersSchema = z.object({
  status: z.enum(["active", "archived"]).optional(),
  sort: z.enum(["created_at", "-created_at", "title"]).default("-created_at"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type ResumeFilters = z.infer<typeof resumeFiltersSchema>;
```

## Step 4: Service Layer

```typescript
// src/services/resume-service.ts
import { createClient } from "@/lib/supabase/server";
import type { CreateResumeInput } from "@/lib/validations/resume";

export async function createResume(userId: string, input: CreateResumeInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resumes")
    .insert({ ...input, user_id: userId })
    .select()
    .single();

  if (error) throw new DatabaseError(error.message);
  return data;
}
```

## Step 5: API Route

```typescript
// src/app/api/v1/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createResumeSchema } from "@/lib/validations/resume";
import { createResume, listResumes } from "@/services/resume-service";
import { withAuth } from "@/lib/supabase/middleware";
import { handleApiError } from "@/lib/utils/api-error-handler";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = createResumeSchema.parse(await req.json());
    const resume = await createResume(user.id, body);
    return NextResponse.json({ data: resume }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
});
```

## Step 6: UI Components

Create with all 5 required states (loading, empty, error, partial, success). Use shadcn/ui primitives. Follow `react-hook-form` + Zod resolver for forms.

## Step 7: Test Stubs

Create `__tests__/` directories adjacent to source with initial test files:

```typescript
// src/services/__tests__/resume-service.test.ts
import { describe, it, expect } from "vitest";
describe("resume-service", () => {
  it.todo("creates a resume with valid input");
  it.todo("throws ValidationError for invalid input");
});
```

## Multi-Tenant SaaS Readiness

Every feature must:

- Scope all queries by `user_id` (tenant isolation)
- Have RLS policies before the feature ships
- Use the `/api/v1/` prefix for all endpoints
- Support pagination on list endpoints
- Include `created_at` and `updated_at` timestamps
