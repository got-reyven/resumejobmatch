# Task: Project Setup & Local Development Configuration

## Goal

Set up the Next.js project with all dependencies, tooling, and folder structure so developers can run the application locally and begin feature development.

## Scope

**In scope:**

- Next.js 14+ with App Router, TypeScript strict mode
- Tailwind CSS + shadcn/ui component library
- Supabase client libraries
- Zod validation, Zustand state management
- ESLint + Prettier + lint-staged + Husky
- Project folder structure per technical-architecture rule
- Environment variable configuration with Zod validation
- Git initialization with proper .gitignore
- Base layout with design tokens (Inter + JetBrains Mono fonts)
- Dev server running successfully

**Out of scope:**

- Supabase project creation / database migrations
- Authentication implementation
- CI/CD pipeline (separate task)
- Deployment configuration

## Approach

1. Initialize Next.js project with TypeScript and Tailwind
2. Install all MVP dependencies
3. Configure shadcn/ui
4. Create folder structure under `src/`
5. Set up environment config with Zod validation
6. Configure code quality tooling (ESLint, Prettier, Husky)
7. Set up base layout, fonts, and design tokens
8. Initialize Git with .gitignore and initial commit
9. Verify dev server starts clean

## Dependencies

- None (this is the foundation task — P0)

## Acceptance Criteria

- [ ] `npm run dev` starts without errors
- [ ] TypeScript strict mode enabled, `tsc --noEmit` passes
- [ ] ESLint and Prettier configured and passing
- [ ] shadcn/ui initialized and a test component renders
- [ ] Folder structure matches technical-architecture rule
- [ ] `.env.example` documents all required variables
- [ ] Git repo initialized with clean initial commit
- [ ] Pre-commit hooks run lint + format
