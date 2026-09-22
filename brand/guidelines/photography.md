# NATUREHOOD Photography & Image Guidelines

Visual rules for images across the website and marketing materials.

**Core rule:** every content image uses **one of five approved aspect ratios**. This keeps photo sizing consistent and professional — instead of the "very random" mix of one-off ratios the site started with. (NAT-7)

---

## Approved Aspect Ratios

Use only these five slots. Each maps to a fixed ratio — never invent a one-off ratio like `1370/738` or `284/730`.

| Slot | Ratio | ≈ | Use for |
|------|-------|------|---------|
| **Hero / banner** | `16/9` | 1.78 | Full-bleed hero images, section background cards |
| **Landscape** | `3/2` | 1.50 | Feature / split images, blog & case-study covers |
| **Portrait card** | `4/5` | 0.80 | Athlete & discover cards, team profiles |
| **Tall profile** | `2/3` | 0.67 | Full-body athlete / founder portraits |
| **Square** | `1/1` | 1.00 | Avatars, thumbnails, square tiles |

**Source of truth:** the five ratios live in `brand/tokens/aspect-ratios.json` and generate into `tokens.ts` (`tokens.aspectRatio`) via `npm run brand:build`. The `AspectRatio` type in `my-app/app/components/media.tsx` is derived from those tokens, so `<MediaImage>` / `<MediaVideo>` can only render an approved ratio — and changing the set means editing the token file, never `tokens.ts` or the component directly.

**Exceptions:** logos, icons, and inline SVG are exempt — size them by intrinsic width with `h-auto`.

---

## Applying a Ratio

Set the ratio on the **container**, then let the image fill it:

```tsx
// Preferred — via the shared component
<MediaImage src={src} alt={alt} aspectRatio="4/5" />

// Manual — when not using MediaImage
<div className="relative w-full aspect-[4/5] overflow-hidden">
  <Image src={src} alt={alt} fill className="object-cover" sizes="..." />
</div>
```

- Always `<Image fill>` + `object-cover` so the photo crops to the slot instead of stretching.
- Set the ratio with Tailwind `aspect-[w/h]` or `style={{ aspectRatio }}` on the wrapper — **not** a fixed one-off pixel height.
- **Rounding:** cards `rounded-2xl`, avatars `rounded-full`, full-bleed hero none.

---

## Per-Page Slot Map

Which approved slot each existing image should adopt. This is the guide for the page-polish issues — **NAT-10 (Home), NAT-11 (About), NAT-12 (Athletes)** — and is **not applied here**.

| Page · slot | File | Current | → Approved |
|-------------|------|---------|------------|
| Home · Hero | `sections/hero.tsx` | `1370/738` | Hero `16/9` |
| Home · Concept background | `sections/concept.tsx` | none (`min-h`) | Hero `16/9` (add ratio) |
| Home · Discover cards | `sections/track-athlete.tsx` | `670/765` | Portrait card `4/5` |
| Home · What We Do | `sections/what-we-do.tsx` | `640/405` | Landscape `3/2` |
| About · Athletes | `about/page.tsx` (athlete) | `388/630` | Tall profile `2/3` |
| About · Founders | `about/page.tsx` (founder) | `284/730` | Tall profile `2/3` ⚠️ |
| Athletes · cards | `ui/profile-card.tsx` (athlete) | `1/1` → `4/5` | Portrait card `4/5` (all breakpoints) |
| Avatars | `platform/Avatar.tsx`, `ui/profile-card.tsx` | `1/1` | Square `1/1` (unchanged) |
| Nav / footer logos | `layout/navigation.tsx`, `layout/footer.tsx` | ~`8/1` | Exempt |

> ⚠️ The Founders grid is currently an extreme `284/730` (≈0.39). Normalizing to `2/3` is a visible crop change — confirm with design before applying.

---

## General Rules
- Use Next.js `<Image>` with `fill` + `object-cover` for background/hero images
- Landing page images go in `/public/images/landing/`
- All images should feel authentic, athletic, and community-driven

## Dark Overlays
- **Hero sections**: Gradient `bg-gradient-to-t from-black/80 via-black/30 to-transparent`
- **Content sections**: Solid `bg-black/40`
- Overlays ensure text readability over images

## Card Image Effects
- **Hover zoom**: `transition-transform duration-700 group-hover:scale-105`
- **Hover overlay**: `bg-black/20 transition-colors group-hover:bg-black/30`

## Image Style
- Moody, high-contrast photography
- Natural lighting preferred over studio
- Athletes in motion or training environments
- Earth tones and greens complement the brand palette
- Avoid overly saturated or heavily filtered images
