---
name: component-development
description: Guides building production-ready React components with all required states, accessibility, responsive design, and shadcn/ui patterns. Use when creating new UI components, forms, data tables, or interactive features.
---

# Component Development

## When to Use

Invoke this skill when:

- Building a new page or feature component
- Creating reusable UI primitives
- Implementing forms, data tables, or interactive elements

## Development Workflow

```
Task Progress:
- [ ] Step 1: Define component API (props, types)
- [ ] Step 2: Implement all 5 states
- [ ] Step 3: Add accessibility
- [ ] Step 4: Make responsive (mobile-first)
- [ ] Step 5: Add interactions and feedback
- [ ] Step 6: Write component test
```

## Step 1: Component API

```typescript
// Define props with clear types — keep the API surface small
interface ResumeCardProps {
  resume: Resume;
  onSelect?: (id: string) => void;
  variant?: "compact" | "detailed";
}

export function ResumeCard({
  resume,
  onSelect,
  variant = "compact",
}: ResumeCardProps) {
  // hooks → derived state → handlers → render
}
```

- Named exports only (never `export default`)
- Props interface colocated in the same file unless shared
- Sensible defaults for optional props
- Max 8 props — decompose or use composition if more

## Step 2: All 5 Required States

Every component that fetches or displays data must handle:

### Loading State

```tsx
// Use skeleton placeholders matching content layout
import { Skeleton } from "@/components/ui/skeleton";

export function ResumeCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}
```

### Empty State

```tsx
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResumeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">No resumes yet</h3>
      <p className="text-muted-foreground mt-1 mb-4">
        Upload your first resume to get started
      </p>
      <Button>Upload Resume</Button>
    </div>
  );
}
```

### Error State

```tsx
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ResumeErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Failed to load resumes. Please try again.</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

## Step 3: Accessibility Checklist

- [ ] Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<button>`)
- [ ] `aria-label` on icon-only buttons and non-text interactive elements
- [ ] `role` attributes only when semantic HTML isn't sufficient
- [ ] Keyboard navigation: Tab order, Enter/Space activation, Escape to dismiss
- [ ] `focus-visible` ring on all interactive elements (Tailwind: `focus-visible:ring-2`)
- [ ] Color contrast ≥ 4.5:1 for text, ≥ 3:1 for large text
- [ ] Alt text on all images (`next/image` enforces this)
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages linked to inputs via `aria-describedby`

## Step 4: Responsive Design

Mobile-first — start narrow, enhance upward:

```tsx
<div
  className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
"
>
  {resumes.map((r) => (
    <ResumeCard key={r.id} resume={r} />
  ))}
</div>
```

| Breakpoint | Width    | Typical Layout              |
| ---------- | -------- | --------------------------- |
| Default    | < 640px  | Single column, stacked      |
| `sm:`      | ≥ 640px  | 2 columns                   |
| `md:`      | ≥ 768px  | Side navigation appears     |
| `lg:`      | ≥ 1024px | 3 columns, expanded details |
| `xl:`      | ≥ 1280px | Full layout, max-w-7xl      |

## Step 5: Interactions and Feedback

- Buttons show loading state during async actions (`disabled` + spinner)
- Toast notifications for success/error on mutations via `sonner`
- Optimistic updates for instant-feeling interactions
- Hover states on all clickable elements (`hover:bg-accent`)
- Transitions for state changes (`transition-colors duration-150`)

## Form Pattern

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createResumeSchema,
  type CreateResumeInput,
} from "@/lib/validations/resume";

export function ResumeForm({
  onSubmit,
}: {
  onSubmit: (data: CreateResumeInput) => void;
}) {
  const form = useForm<CreateResumeInput>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: { title: "", fileType: "pdf" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Use shadcn/ui Form components with field-level error display */}
    </form>
  );
}
```

## Data Table Pattern

For list views use `@tanstack/react-table` with shadcn/ui DataTable:

- Server-side pagination via query params
- Sortable columns with URL state
- Row actions in a dropdown menu
- Bulk selection for batch operations
- Responsive: hide non-essential columns on mobile
