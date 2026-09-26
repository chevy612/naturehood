# NATUREHOOD Component Patterns

Canonical patterns for buttons, cards, tags, and avatars across both themes.

---

## Buttons

### Marketing Buttons (Light Theme)
All marketing buttons are **pill-shaped** (`rounded-full`), DM Sans, 14px, font-semibold:

| Variant | Classes |
|---|---|
| Primary (white) | `bg-white text-black rounded-full px-8 py-3.5 text-[14px] font-semibold` |
| Secondary (outline) | `border border-white/30 text-white rounded-full px-8 py-3.5 text-[14px] font-semibold` |
| Hover (primary) | `hover:bg-white/90` |
| Hover (secondary) | `hover:bg-white/10` |

### Platform Buttons (Dark Theme)
Use components from `buttons.tsx`:
- `ButtonPrimary` — standard action
- `ButtonAccent` — emphasized CTA (lime bg)
- `ButtonSecondary` — secondary action
- `ButtonGhost` — minimal, text-only
- `ButtonIcon` — icon-only button
- `ButtonTab` — tab-style toggle
- `ButtonSubmit` — form submission

---

## PillTag Variants

| Variant | Use case |
|---|---|
| `ghost-green` | Role badges, workout types, durations (platform default) |
| `ghost-dark` | Secondary labels on dark backgrounds |
| `accent` | Emphasis, active state |
| `ghost-light` | Labels on light backgrounds |

---

## Avatar

- Always `<Avatar name={...} size="sm|md|lg" photoUrl={...} />`
- Pass `photoUrl` from `profiles.avatar_url`
- `sm` in feed cards, `lg` on profile pages
- Ring is always lime (`ring-2 ring-[#F5F5F5]`) — never change this

---

## Cards (Platform)

- Container: `border border-[#3A373C] bg-[#1A1719] p-5`
- Hover: `hover:border-[#F5F5F5]/40`
- Dividers in lists: `divide-y divide-[#3A373C]`
