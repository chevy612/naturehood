# NATUREHOOD — Claude Instructions

## Project Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase (auth + database)

## Component Reuse Policy — CRITICAL

**Before creating any new component, utility, or handler, you MUST:**

1. **Search for existing components** in:
   - `my-app/app/components/ui/` — atomic UI: `buttons.tsx`, `inputs.tsx`, `tags.tsx`, `typography.tsx`, `tokens.ts`, `profile-card.tsx`
   - `my-app/app/components/platform/` — platform UI: `Avatar.tsx`, `BottomNav.tsx`, `FeedCard.tsx`, `EventCard.tsx`
   - `my-app/app/components/sections/` — marketing page sections (hero, concept, track-athlete, what-we-do, email-subscribe)
   - `my-app/app/components/layout/` — marketing layout (navigation, footer, email)
   - `my-app/app/components/forms/` — form components (`form-ui.tsx`)

2. **Search for existing utilities and handlers** in:
   - `my-app/lib/supabase/client.ts` — client-side Supabase instance
   - `my-app/lib/supabase/server.ts` — server-side Supabase instance
   - `my-app/lib/supabase/middleware.ts` — auth middleware
   - `my-app/lib/utils.ts` — general utilities
   - `my-app/lib/types.ts` — shared TypeScript types (`TrainingLog`, `Event`, `EventSignup`)

3. **Use Grep or Glob to search** before writing any new code. For example:
   - Need a button? Check `buttons.tsx` first — 6 variants exist (`ButtonPrimary`, `ButtonSecondary`, `ButtonAccent`, `ButtonGhost`, `ButtonIcon`, `ButtonTab`, `ButtonSubmit`)
   - Need a form input in the platform (dark)? Use `InputDark` / `TextAreaDark` / `SelectDark` from `inputs.tsx`
   - Need a badge/label? Use `PillTag` with the correct variant from `tags.tsx`
   - Need a user avatar? Use `Avatar` from `components/platform/Avatar.tsx` — supports `photoUrl`
   - Need a Supabase client? Import from `lib/supabase/client.ts` or `lib/supabase/server.ts`

4. **Extend, don't duplicate**: If an existing component is close but not perfect, add a variant rather than creating a new file.

5. **Only create new files** when nothing suitable exists after a thorough search.

## Design System

Brand tokens, guidelines, and assets live in `brand/`. Use `/brand` to load design context during development.

- **Tokens (source of truth)**: `brand/tokens/` — colors, typography, spacing, radii, motion (platform-agnostic JSON)
- **Guidelines**: `brand/guidelines/` — themes, components, photography usage rules
- **Generated web tokens**: `my-app/app/components/ui/tokens.ts` + CSS vars in `globals.css`

### Key Facts
- **2-font system**: Sk Modernist (display: hero/h1/h2) + DM Sans (everything else)
- **Inter has been removed** — all h3, buttons, labels, UI text use DM Sans
- **Accent**: `#F5F5F5` (lime) — CTAs, active states
- **Dark theme bg**: `#141115` (ink) — platform pages
- **Light theme bg**: `#F5F5F5` (cloud) or white — marketing pages
- Always set font via `style={{ fontFamily: "..." }}` — Tailwind v4 cannot resolve custom font families

**Never edit `tokens.ts` directly** — edit `brand/tokens/*.json` and run `npm run brand:build`.

For detailed theme rules, component patterns, and image conventions, see `brand/guidelines/`.

## Code Style
- Use design tokens from `my-app/app/components/ui/tokens.ts` for colors/spacing
- Use `lucide-react` for all icons (already installed)
- Use `clsx` + `tailwind-merge` for conditional class names
- Prefer server components unless interactivity requires `"use client"`
- Inline `style={{ fontFamily: ... }}` for font family — Tailwind v4 doesn't cover custom fonts here

## Environments
- **Dev Supabase project**: `jkaucsreqaywqxjwvteh` — used in `.env.local`
- **Prod Supabase project**: `vddlfdngjtcoxcyuvkbd` — keys stored in Vercel Dashboard only
- Never hardcode Supabase URLs or keys — always use `process.env.*`
- Local dev: `npm run dev` (uses `.env.local`)
- Production build: `npm run build:prod`

## Supabase MCP
- Use the `supabase-dev` MCP server to query the dev database during development
- Always prefer read-only queries; ask the user before running INSERT/UPDATE/DELETE
- Never connect to `supabase-prod` unless explicitly asked by the user
