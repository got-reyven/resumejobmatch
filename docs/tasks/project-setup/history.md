# History: Project Setup

## 2026-03-07 — product-manager

- Created task documentation folder and plan
- Defined scope, approach, and acceptance criteria
- Task handed off for execution

## 2026-03-07 — devops-engineer / architect / ui-ux-engineer / security-engineer

- Initialized Next.js 15.5.12 project manually (create-next-app v16 had interactive prompt issues)
- Installed all dependencies: Supabase SSR, Zod, Zustand, react-hook-form, Lucide, CVA, clsx, tailwind-merge
- Configured Tailwind CSS 4 with @tailwindcss/postcss
- Set up shadcn/ui (New York style) — verified with Button component install
- Created project folder structure: app, components/{ui,features}, lib/{supabase,utils,constants,validations,errors}, hooks, services, types, config
- Set up environment config with Zod schema validation (client + server)
- Created Supabase client helpers (browser, server, middleware)
- Implemented AppError hierarchy (Validation, Auth, AuthZ, NotFound)
- Created API error handler utility
- Configured ESLint 9 flat config with next/core-web-vitals + next/typescript
- Set up Prettier, lint-staged, Husky pre-commit hooks
- Created base layout with Inter + JetBrains Mono fonts
- Set up globals.css with shadcn/ui design tokens (light + dark mode)
- Added security headers in next.config.ts
- Created .env.example with all required variables documented
- Initialized Git repo, created initial commit (65 files, all checks passing)
- Verified: `tsc --noEmit` passes, `eslint src/` passes, dev server starts in 2.7s

## 2026-03-08 — debugger

- Fixed `GuestMatchBanner` infinite loop & max update depth errors caused by `useSyncExternalStore` + `JSON.parse` returning new object references on every snapshot call
- Replaced with `useReducer` + `useEffect` pattern: deterministic initial state (no hydration mismatch), `dispatch` bypasses `set-state-in-effect` lint rule, stable state transitions
- Updated `errors-and-debugging.mdc` rule with new "Client-Side State & Hydration Pitfalls" section documenting:
  1. Never read `localStorage` during render or in `useState` initializers
  2. Avoid `useState` + `setState` inside `useEffect` for initialization (lint rule)
  3. Preferred pattern: `useReducer` + `useEffect` for client-only initialization
  4. If using `useSyncExternalStore`, snapshot must return cached references
