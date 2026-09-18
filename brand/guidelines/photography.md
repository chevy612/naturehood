# NATUREHOOD Photography & Image Guidelines

Visual rules for images across the website and marketing materials.

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

## Aspect Ratios
- **Portrait cards**: `aspect-[4/5]` — athlete cards, team profiles
- **Landscape**: `aspect-[3/2]` — feature images, blog covers

## Image Style
- Moody, high-contrast photography
- Natural lighting preferred over studio
- Athletes in motion or training environments
- Earth tones and greens complement the brand palette
- Avoid overly saturated or heavily filtered images
