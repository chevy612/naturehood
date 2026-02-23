# NATUREHOOD — Claude Instructions

## Project Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase (auth + database)

## Component Reuse Policy — CRITICAL

**Before creating any new component, utility, or handler, you MUST:**

1. **Search for existing components** in:
   - `my-app/app/components/ui/` — atomic UI (buttons, inputs, typography, tags, containers, sections)
   - `my-app/app/components/sections/` — page sections (hero, intro, email-subscribe, how-we-work)
   - `my-app/app/components/layout/` — layout (navigation, footer, email)
   - `my-app/app/components/forms/` — form components

2. **Search for existing utilities and handlers** in:
   - `my-app/lib/supabase/client.ts` — client-side Supabase instance
   - `my-app/lib/supabase/server.ts` — server-side Supabase instance
   - `my-app/lib/supabase/middleware.ts` — auth middleware
   - `my-app/lib/utils.ts` — general utilities

3. **Use Grep or Glob to search** before writing any new code. For example:
   - Search for a button? Check `buttons.tsx` first.
   - Need a form input? Check `inputs.tsx` first.
   - Need a Supabase client? Import from `lib/supabase/client.ts` or `lib/supabase/server.ts`.

4. **Extend, don't duplicate**: If an existing component is close but not perfect, extend or
   add a variant to it rather than creating a separate component.

5. **Only create new files** when nothing suitable exists after a thorough search.

## Code Style
- Use design tokens from `my-app/app/components/ui/tokens.ts` for colors/spacing
- Use `lucide-react` for all icons (already installed)
- Use `clsx` + `tailwind-merge` for conditional class names
- Prefer server components unless interactivity requires `"use client"`

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
