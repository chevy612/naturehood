# CLAUDE.md — NatureHood

This file documents the codebase structure, conventions, and development workflows for AI assistants working in this repository.

---

## Project Overview

**NatureHood** is a Next.js web platform connecting athletes and brands in Hong Kong. It handles user registration (athletes and brands), brand partnership applications, and marketing landing pages.

- **Deployed on:** Vercel
- **Backend:** Supabase (database + auth)
- **Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4

---

## Repository Layout

```
naturehood/
├── vercel.json          # Vercel deployment config
└── my-app/              # All application code lives here
    ├── app/             # Next.js App Router pages & components
    ├── lib/             # Supabase client utilities
    ├── public/          # Static assets (images, fonts, icons)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    ├── eslint.config.mjs
    └── components.json  # Shadcn/ui config
```

The application root is `my-app/`. Always run commands and resolve paths from there.

---

## App Directory Structure

```
my-app/app/
├── layout.tsx                    # Root layout (fonts, ConditionalLayout)
├── page.tsx                      # Home page (/)
├── globals.css                   # Design tokens + base reset
│
├── auth/callback/route.ts        # OAuth redirect handler
├── about/page.tsx                # About page
├── business/page.tsx             # Brand partnership page
├── signup/
│   ├── page.tsx                  # Signup entry
│   ├── success/page.tsx          # Post-signup confirmation
│   ├── actions.ts                # Server actions (quickSignUp, signUpNewUser, submitBrandPartnership)
│   └── middleware.ts             # Route-level auth guard
├── login/                        # Auth page
├── team/                         # Team page
│
└── components/
    ├── ConditionalLayout.tsx     # Wraps Navigation + Footer conditionally
    ├── signup-forms.tsx          # Multi-step signup forms (athlete / brand)
    ├── media.tsx                 # Media display component
    ├── clock.tsx                 # Clock utility component
    │
    ├── layout/                   # Structural chrome
    │   ├── navigation.tsx        # Top nav with Supabase auth state
    │   └── footer.tsx            # Site footer
    │
    ├── sections/                 # Full-width page sections
    │   ├── Hero.tsx
    │   ├── introduction.tsx
    │   ├── how-we-work.tsx
    │   ├── email-subscribe.tsx
    │   └── index.ts              # Barrel export
    │
    ├── ui/                       # Design system primitives
    │   ├── buttons.tsx           # Button variants (CVA)
    │   ├── inputs.tsx            # Input components
    │   ├── typography.tsx        # Text components
    │   ├── container.tsx         # Layout container
    │   ├── section.tsx           # Section wrapper
    │   ├── tags.tsx              # Tag/badge components
    │   ├── notification.tsx      # Notification UI
    │   ├── tokens.ts             # Design token constants (JS)
    │   └── index.ts              # Barrel export
    │
    └── forms/
        └── form-ui.tsx           # Shared form field components
```

---

## Development Commands

All commands run from `my-app/`:

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint
```

There are no tests configured. Do not add test files without first setting up a framework.

---

## Environment Variables

Create `my-app/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for all Supabase operations including auth.
- `NEXT_PUBLIC_SITE_URL` is used in the email confirmation redirect URL during signup.

---

## Supabase Integration

### Client helpers (`lib/supabase/`)

| File | Usage |
|------|-------|
| `client.ts` | Browser client — use in client components (`'use client'`) |
| `server.ts` | Server client — use in Server Components and Server Actions |
| `middleware.ts` | Supabase session refresh in Next.js middleware |

Always import from `@/lib/supabase/client` or `@/lib/supabase/server`, not directly from `@supabase/supabase-js`.

### Database tables

| Table | Purpose |
|-------|---------|
| `quick_signups` | Waitlist/early-access signups (name, email, role, terms) |
| `profiles` | Auth user profiles (username, is_business) |
| `brand_applications` | Brand partnership form submissions |

### Server Actions pattern

Server actions live in `app/*/actions.ts` with `'use server'` at the top. They validate inputs, call Supabase, and return `{ success: true }` or `{ error: string }`. Do not throw errors — always return the error shape.

```ts
// Correct pattern
export async function myAction(data: MyData) {
  const supabase = await createClient()
  const { error } = await supabase.from('table').insert(...)
  if (error) return { error: 'Human-readable message' }
  return { success: true }
}
```

---

## Design System

### Fonts

| Variable | Font | Use |
|----------|------|-----|
| `--font-inter` | Inter | All headings (h1–h6) |
| `--font-ui` | DM Sans | Body copy, UI labels, inputs |

Fonts are loaded in `app/layout.tsx` via `next/font/google` and injected as CSS variables.

### Color Tokens

Defined in `app/globals.css` as CSS custom properties and mirrored in `app/components/ui/tokens.ts` for use in JS/TS:

| Token | Hex | Role |
|-------|-----|------|
| `--color-ink` | `#141115` | Primary dark background |
| `--color-cloud` | `#F5F5F5` | Primary light background |
| `--color-accent` | `#C8F04D` | Brand accent (lime green) |
| `--color-surface-1` | `#1E1B1F` | Dark surface |
| `--color-surface-2` | `#2A272C` | Elevated dark surface |
| `--color-border` | `#3A373C` | Borders |
| `--color-text-sec` | `#6B6870` | Secondary text |
| `--color-error` | `#FF4D4D` | Errors |
| `--color-warning` | `#F5A623` | Warnings |

Always use these tokens — do not hardcode hex values in components.

### Typography Scale

Defined in `tokens.ts` and globally in `globals.css`. Use `clamp()` for fluid sizing:

```
hero  — clamp(52px, 8vw, 88px)  — Inter 900
h1    — clamp(38px, 5vw, 60px)  — Inter 700
h2    — clamp(26px, 4vw, 40px)  — Inter 700
h3    — clamp(20px, 3vw, 28px)  — Inter 600
label — 10px, uppercase, 0.3em spacing — DM Sans 600
body  — 16px — DM Sans 400
```

### Spacing Tokens (`tokens.spacing`)

```ts
section:    "py-12 sm:py-16 md:py-20 lg:py-24"
sectionSm:  "py-8 sm:py-10 md:py-12 lg:py-16"
container:  "px-4 sm:px-6 md:px-8 lg:px-12"
```

Use these via `tokens.spacing.*` or mirror them with Tailwind classes.

### Component Library

This project uses **Shadcn/ui** (new-york style) with Radix UI primitives. The local design system in `app/components/ui/` extends these with project-specific variants using `class-variance-authority` (CVA) and `tailwind-merge`.

- Import UI primitives from `@/app/components/ui` (barrel export via `index.ts`)
- Import section components from `@/app/components/sections` (barrel export via `index.ts`)

---

## Conventions

### TypeScript

- Strict mode is enabled. Do not disable it or add `@ts-ignore` without a clear reason.
- Use explicit interface types for Server Action data shapes (see `actions.ts`).
- Path alias `@/*` maps to `my-app/` root.

### Component Patterns

- **Server Components by default.** Add `'use client'` only when you need browser APIs, event handlers, or React state/effects.
- **Server Actions** for all data mutations. Never expose Supabase keys in client-side mutation code.
- Keep page components thin — delegate rendering to section and UI components.
- `ConditionalLayout` in `layout.tsx` wraps all pages and handles Navigation/Footer visibility per route.

### Styling

- Use Tailwind CSS utility classes as the primary styling mechanism.
- Use CSS custom property tokens (from `globals.css`) for colors, not Tailwind color names.
- Do not write arbitrary inline `style={{}}` objects for colors or spacing — use tokens and Tailwind classes.
- All layout sections should use `tokens.spacing.section` or `tokens.spacing.sectionSm` for vertical padding.

### File Naming

- Pages: `page.tsx` (Next.js convention)
- Components: `PascalCase.tsx` for component files
- Utilities/actions: `camelCase.ts`
- Barrel exports: `index.ts`

### Legacy Code

`app/components/ui/old/` contains the v2 design system. Do not modify or import from it. New components go in `app/components/ui/`.

---

## Authentication Flow

1. User submits signup form → `signUpNewUser()` server action calls `supabase.auth.signUp()`
2. Supabase sends confirmation email with redirect to `/auth/callback`
3. `app/auth/callback/route.ts` exchanges the code for a session
4. Navigation component (`app/components/layout/navigation.tsx`) reads session state client-side to show login/logout UI

For protected routes, use `app/signup/middleware.ts` as a reference pattern.

---

## Deployment

- **Platform:** Vercel (config in `vercel.json`)
- **Build command:** `npm run build` (run from `my-app/`)
- **Output:** `.next/`
- **Install command:** `npm install`
- Pushes to `master` trigger automatic deployments.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `my-app/app/layout.tsx` | Root layout, font injection |
| `my-app/app/globals.css` | Design tokens, base reset, global styles |
| `my-app/app/components/ui/tokens.ts` | JS design token constants |
| `my-app/app/signup/actions.ts` | All signup/auth server actions |
| `my-app/lib/supabase/client.ts` | Browser Supabase client |
| `my-app/lib/supabase/server.ts` | Server Supabase client |
| `my-app/app/auth/callback/route.ts` | OAuth callback |
| `my-app/components.json` | Shadcn/ui configuration |
