---
name: cicd-and-deployment
description: Sets up and manages CI/CD pipelines with GitHub Actions, Vercel deployment, and release workflows. Use when configuring CI/CD, managing deployments, setting up pre-commit hooks, or creating release processes.
---

# CI/CD and Deployment

## When to Use

Invoke this skill when:

- Setting up or modifying the CI/CD pipeline
- Configuring Vercel deployment settings
- Setting up Git hooks (Husky + lint-staged)
- Managing database migrations in CI
- Creating release and versioning workflows

## CI Pipeline (GitHub Actions)

### Quality Gate Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type Check
        run: npx tsc --noEmit

      - name: Unit Tests
        run: npm run test -- --coverage

      - name: Build
        run: npm run build

      - name: Upload Coverage
        if: github.event_name == 'pull_request'
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: quality
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Pre-Commit Hooks

```json
// package.json
{
  "scripts": {
    "prepare": "husky",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

## Vercel Deployment Configuration

```json
// vercel.json (only if customization needed)
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm ci"
}
```

### Environment Variables in Vercel

| Variable                        | Environment         | Notes                     |
| ------------------------------- | ------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | All                 | Public, safe for client   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All                 | Public, safe for client   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Production, Preview | Server-only, never public |
| `AI_PROVIDER`                   | All                 | `openai` or `anthropic`   |
| `OPENAI_API_KEY`                | All                 | Server-only               |

### Deployment Flow

```
PR created → Vercel Preview Deploy → CI checks → Review → Merge to main → Vercel Production Deploy
```

- Preview deployments for every PR (Vercel default)
- Production deploys only from `main` branch
- Environment variables differ per deployment target

## Database Migration Strategy

```bash
# Local development
supabase db reset          # Reset and re-run all migrations
supabase migration new     # Create a new migration file

# CI/CD (production)
supabase db push           # Apply pending migrations
```

Migrations run **before** deployment. If a migration fails, the deploy is blocked.

### Migration Safety Rules

- Never modify a deployed migration — create a new one
- Always test migrations locally with `supabase db reset`
- Backward-compatible changes only (additive) — drop columns in a separate release
- Wrap destructive operations in transactions

## Release Process

```bash
# 1. Create release branch
git checkout -b release/v0.2.0

# 2. Update version in package.json
npm version minor --no-git-tag-version

# 3. Create PR, merge to main

# 4. Tag the release
git tag v0.2.0
git push origin v0.2.0

# 5. Create GitHub release
gh release create v0.2.0 --generate-notes
```

## Monitoring Checklist

- [ ] Vercel Analytics enabled (free tier)
- [ ] Build logs reviewed for warnings
- [ ] No route exceeds 100kB first-load JS
- [ ] Preview deploy tested before merge
- [ ] Database migrations verified in staging
