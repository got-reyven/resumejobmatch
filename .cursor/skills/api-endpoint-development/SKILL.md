---
name: api-endpoint-development
description: End-to-end workflow for creating RESTful API endpoints with validation, auth, error handling, and documentation. Use when building new API routes, adding CRUD operations, or extending the backend API surface.
---

# API Endpoint Development

## When to Use

Invoke this skill when:

- Creating new API endpoints for a feature
- Adding CRUD operations for a resource
- Extending existing endpoints with new query params or operations

## Development Workflow

```
Task Progress:
- [ ] Step 1: Define the resource and operations
- [ ] Step 2: Create Zod request/response schemas
- [ ] Step 3: Implement service functions
- [ ] Step 4: Create route handlers
- [ ] Step 5: Add RLS policies for the resource
- [ ] Step 6: Write API tests
- [ ] Step 7: Document the endpoint
```

## Step 1: Resource Definition

| Field         | Example                                      |
| ------------- | -------------------------------------------- |
| Resource name | `resumes`                                    |
| Base URL      | `/api/v1/resumes`                            |
| Operations    | GET (list), GET (by id), POST, PATCH, DELETE |
| Auth          | Required for all operations                  |
| Pagination    | Yes (list endpoint)                          |
| Filters       | `?status=active&sort=-created_at`            |

## Step 2: Zod Schemas

```typescript
// src/lib/validations/resume.ts
import { z } from "zod";

export const createResumeSchema = z.object({
  title: z.string().min(1).max(200),
  fileUrl: z.string().url(),
  fileType: z.enum(["pdf", "docx"]),
});

export const updateResumeSchema = createResumeSchema.partial();

export const resumeQuerySchema = z.object({
  status: z.enum(["active", "archived"]).optional(),
  sort: z.string().default("-created_at"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Response types inferred from Zod
export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
```

## Step 3: Service Functions

```typescript
// src/services/resume-service.ts
import { createClient } from "@/lib/supabase/server";
import { NotFoundError } from "@/lib/errors";

export async function listResumes(userId: string, filters: ResumeFilters) {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  const query = supabase
    .from("resumes")
    .select("id, title, status, created_at", { count: "exact" })
    .eq("user_id", userId)
    .range(from, to);

  if (filters.status) query.eq("status", filters.status);
  if (filters.sort) query.order(parseSortParam(filters.sort));

  const { data, count, error } = await query;
  if (error) throw new DatabaseError(error.message);

  return { data: data ?? [], total: count ?? 0 };
}
```

## Step 4: Route Handlers

### Collection Route (list + create)

```typescript
// src/app/api/v1/resumes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/supabase/middleware";
import { handleApiError } from "@/lib/utils/api-error-handler";
import {
  createResumeSchema,
  resumeQuerySchema,
} from "@/lib/validations/resume";
import { listResumes, createResume } from "@/services/resume-service";

// GET /api/v1/resumes — List user's resumes
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const params = resumeQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    const { data, total } = await listResumes(user.id, params);
    return NextResponse.json({
      data,
      meta: { total, page: params.page, pageSize: params.pageSize },
    });
  } catch (error) {
    return handleApiError(error);
  }
});

// POST /api/v1/resumes — Create a resume
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

### Single Resource Route (get, update, delete)

```typescript
// src/app/api/v1/resumes/[id]/route.ts
// GET /api/v1/resumes/:id — Get single resume
// PATCH /api/v1/resumes/:id — Update resume
// DELETE /api/v1/resumes/:id — Delete resume (soft delete)
```

## Step 5: Error Response Consistency

All endpoints use `handleApiError` which maps `AppError` subclasses to HTTP responses:

```typescript
// src/lib/utils/api-error-handler.ts
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: formatZodErrors(error),
        },
      },
      { status: 400 }
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: { code: error.code, message: error.message },
      },
      { status: error.statusCode }
    );
  }
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}
```

## Step 6: API Tests

```typescript
// src/app/api/v1/resumes/__tests__/route.test.ts
describe("POST /api/v1/resumes", () => {
  it("returns 201 with created resume for valid input", async () => {
    /* ... */
  });
  it("returns 400 for invalid file type", async () => {
    /* ... */
  });
  it("returns 401 for unauthenticated request", async () => {
    /* ... */
  });
});
```

## SaaS Readiness Checklist

- [ ] Endpoint under `/api/v1/` prefix
- [ ] All mutations validated with Zod
- [ ] Auth enforced via `withAuth` middleware
- [ ] List endpoints paginated (default 20, max 100)
- [ ] Consistent response envelope (`{ data, meta }` or `{ error }`)
- [ ] Rate limiting middleware applied (when ready)
- [ ] Idempotency key support for critical writes (when ready)
