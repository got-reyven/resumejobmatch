---
name: internationalization
description: Implements internationalization (i18n) and localization (l10n) for worldwide SaaS deployment using next-intl. Use when adding user-facing text, setting up translations, or preparing the app for multi-language support.
---

# Internationalization (i18n)

## When to Use

Invoke this skill when:

- Writing any user-facing text (labels, messages, errors)
- Setting up or extending the translation infrastructure
- Adding a new language/locale
- Handling locale-specific formatting (dates, numbers, currencies)

## i18n Stack

| Concern                | Solution                                           |
| ---------------------- | -------------------------------------------------- |
| Translation framework  | `next-intl` (App Router native, RSC-compatible)    |
| Message format         | ICU MessageFormat (plurals, gender, interpolation) |
| Locale detection       | Accept-Language header + user preference           |
| URL strategy           | Prefix-based: `/en/dashboard`, `/es/dashboard`     |
| Date/number formatting | `Intl` API via `next-intl` formatters              |

## Setup Structure

```
messages/
  en.json                   # English (source locale)
  es.json                   # Spanish
  fr.json                   # French
  pt.json                   # Portuguese
  // add more as needed
src/
  i18n/
    config.ts               # Supported locales, default locale
    request.ts              # next-intl request configuration
  app/
    [locale]/               # Dynamic locale segment
      layout.tsx            # Wraps with NextIntlClientProvider
      page.tsx
```

## Configuration

```typescript
// src/i18n/config.ts
export const locales = ["en", "es", "fr", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
```

```typescript
// src/i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "./config";

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../../messages/${locale}.json`)).default,
}));
```

## Message File Format

```json
// messages/en.json
{
  "common": {
    "appName": "Resume Job Match",
    "loading": "Loading...",
    "retry": "Try again",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Are you sure?"
  },
  "auth": {
    "signIn": "Sign in",
    "signOut": "Sign out",
    "email": "Email address",
    "password": "Password"
  },
  "resume": {
    "title": "My Resumes",
    "upload": "Upload Resume",
    "empty": "No resumes yet. Upload your first resume to get started.",
    "matchScore": "Match Score: {score, number, percent}",
    "skillCount": "{count, plural, =0 {No skills} one {# skill} other {# skills}} found"
  },
  "errors": {
    "generic": "Something went wrong. Please try again.",
    "notFound": "{resource} not found",
    "unauthorized": "Please sign in to continue",
    "fileTooLarge": "File must be under {maxSize}",
    "invalidFileType": "Only {types} files are accepted"
  }
}
```

## Usage in Components

### Server Components (preferred)

```tsx
import { useTranslations } from "next-intl";

export default function ResumePage() {
  const t = useTranslations("resume");
  return <h1>{t("title")}</h1>;
}
```

### Client Components

```tsx
"use client";
import { useTranslations } from "next-intl";

export function ResumeUploadButton() {
  const t = useTranslations("resume");
  return <Button>{t("upload")}</Button>;
}
```

### With Interpolation

```tsx
// ICU MessageFormat for plurals, numbers, dates
t("skillCount", { count: 5 }); // "5 skills found"
t("matchScore", { score: 0.85 }); // "Match Score: 85%"
t("errors.fileTooLarge", { maxSize: "5MB" });
```

## Rules for All User-Facing Text

1. **Never hardcode strings** — always use translation keys
2. **Namespace by feature** — `resume.*`, `auth.*`, `dashboard.*`
3. **English is the source** — `en.json` is always complete and up-to-date
4. **ICU format for dynamic content** — plurals, numbers, dates, interpolation
5. **Keep keys semantic** — `resume.upload` not `resume.button1`
6. **Error messages are translatable** — `AppError.message` maps to i18n keys

## Date, Number, and Currency Formatting

```tsx
import { useFormatter } from "next-intl";

export function ResumeDate({ date }: { date: Date }) {
  const format = useFormatter();
  return <time>{format.dateTime(date, { dateStyle: "medium" })}</time>;
}
```

- Always use `Intl` formatters via `next-intl`, never `toLocaleDateString()` directly
- Store dates as UTC in the database, format in the user's locale at render time
- Currency formatting: prepare for multi-currency when billing is added

## Adding a New Language

1. Create `messages/{locale}.json` by copying `en.json`
2. Translate all keys (or mark incomplete keys for later)
3. Add the locale to `locales` array in `src/i18n/config.ts`
4. Test with `?locale={locale}` or by navigating to `/{locale}/`
