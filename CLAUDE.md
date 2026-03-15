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
   - `my-app/app/components/sections/` — marketing page sections (hero, intro, email-subscribe, how-we-work)
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

## Platform Design System

The `(platform)` route group uses a **dark theme** throughout. Follow these conventions exactly.

### Colors (key values — full token list in `tokens.ts`)
| Role | Value |
|---|---|
| Background | `#141115` |
| Surface (cards) | `#1A1719` or `#1E1B1F` |
| Surface hover | `#2A272C` |
| Border | `#3A373C` |
| Accent / lime | `#C8F04D` |
| Text primary | `#FFFFFF` |
| Text muted | `#6B6870` |
| Text disabled | `#A09EA3` |
| Error | `#FF4D4D` |

### Typography
- **Headings / labels**: `fontFamily: "'Inter', sans-serif"` — always set via inline style
- **Body / UI text**: `fontFamily: "'DM Sans', sans-serif"` — always set via inline style
- **Section labels**: `text-[10px] font-semibold tracking-[0.3em] uppercase text-[#C8F04D]`
- **Page headers**: `text-[13px] font-semibold text-white` (Inter, `-0.01em` letterSpacing)
- **Muted metadata**: `text-[12px] text-[#6B6870]` (DM Sans)
- **Body content**: `text-[13px] sm text-[#6B6870] leading-relaxed` (DM Sans)

### Platform Page Layout Standard
```tsx
// Every platform page follows this shell:
<div className="min-h-screen bg-[#141115] px-6 py-10">
  <div className="max-w-2xl mx-auto">
    {/* content */}
  </div>
</div>
```

### Form Convention (platform)
- Use `InputDark`, `TextAreaDark`, `SelectDark` — **never** the light-mode variants in platform pages
- Stack inputs with `space-y-6` inside `<form>`
- Submit button: `px-6 py-3 bg-[#C8F04D] text-[#141115] text-[13px] font-bold uppercase tracking-[0.15em]`
- Success message: `text-[#C8F04D]`, error message: `text-[#FF4D4D]`

### PillTag Variants — When to Use Which
| Variant | Use case |
|---|---|
| `ghost-green` | Role badges, workout types, durations (platform default) |
| `ghost-dark` | Secondary labels on dark backgrounds |
| `accent` | Emphasis, active state |
| `ghost-light` | Labels on light backgrounds |

### Avatar
- Always `<Avatar name={...} size="sm|md|lg" photoUrl={...} />` — pass `photoUrl` from `profiles.avatar_url`
- `sm` in feed cards, `lg` on profile pages
- Ring is always lime (`ring-2 ring-[#C8F04D]`) — never change this

### Cards (feed / events)
- Container: `border border-[#3A373C] bg-[#1A1719] p-5`
- Hover: `hover:border-[#C8F04D]/40`
- Dividers in lists: `divide-y divide-[#3A373C]`

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
