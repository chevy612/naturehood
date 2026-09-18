# NATUREHOOD Themes

Two distinct visual themes used across the application.

---

## Marketing Theme (Light)

Used in the `(marketing)` route group — landing pages, about, athletes, business.

### Colors
| Role | Value |
|---|---|
| Page background | `white` or `#F5F5F5` (cloud) |
| Primary text | `#141115` (ink) or `black` |
| Secondary text / body | `#6B6870` |
| Muted foreground | `#847E89` |
| Accent / lime | `#F5F5F5` |
| Brand green | `#F5F5F5` |
| Border | `#3D3940` |
| Disabled text | `#A09EA3` |

### Typography
- **Display headings** (hero, h1, h2): Sk Modernist via `.nh-hero`, `.nh-h1`, `.nh-h2` classes
- **All other text**: DM Sans — h3 (`.nh-h3`), body (`.nh-body`), labels (`.nh-label`), etc.

**Headings on dark/image backgrounds**: `.nh-h2 text-white`
**Headings on light backgrounds**: `.nh-h2 text-black`

**Body text on dark/image backgrounds:**
```tsx
className="text-white/80 text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed"
style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
```

**Body text on light backgrounds:**
```tsx
className="text-[#6B6870] text-[16px] sm:text-[18px] leading-relaxed"
style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
```

**Labels**: `.nh-label text-white/50` (dark bg) or `.nh-label text-[#6B6870]` (light bg)

### Layout Containers
- **`ContentContainer`** — standard wrapper for all marketing sections:
  - Outer padding: `px-6 sm:px-12 md:px-[108px]`
  - Inner max-width: `1224px`, centered
  - Supports `as="section"` (default) or `as="div"`
- **`SplitGrid`** — two-column 50/50 layout:
  - `grid-cols-1 md:grid-cols-2 gap-6 md:gap-[30px]`
- **Section vertical spacing**: `py-6 md:py-[30px]` between sections

### Navigation Bar
- **Style**: Floating pill with backdrop blur (`bg-black/90 backdrop-blur-md rounded-full border border-white/10`)
- **Behavior**: Hide on scroll down, show on scroll up, always visible near top
- **Desktop**: h-[72px], padding `px-8 lg:px-12`
- **Mobile**: h-[52px], hamburger menu, slide-out left drawer (`bg-black`)
- **Nav links**: DM Sans, `text-[15px]`, font-medium, `text-white/80 hover:text-white`, tracking-wide
- **CTA button**: `bg-white text-black rounded-full px-6 py-2.5 text-[14px] font-semibold`
- **Logo**: `/naturehood.svg`, width `140px lg:180px` (desktop), `120px` (mobile)

### Footer
- Background: `bg-black`, border-top `border-white/10`
- Social icons: `bg-white/5 rounded-full`, hover `bg-white/10 text-white`
- All text: DM Sans, `text-white/30` to `text-white/40`
- Tagline: `text-[13px] text-white/40`
- Legal links: `text-[12px] text-white/30 hover:text-white/60`

### Landing Page Structure
```tsx
<div className="min-h-screen flex flex-col bg-white">
  <HeroSection />        {/* Full-viewport, gradient overlay, bottom-aligned content */}
  <ConceptSection />     {/* Full-width image, centered text, dark overlay */}
  <TrackAthleteSection />{/* SplitGrid portrait cards, hover zoom, bottom-aligned text */}
  <WhatWeDoSection />    {/* SplitGrid text+image, white bg */}
  <EmailSubscribe />     {/* Black bg, pill-shaped email input */}
</div>
```

Sections exported from `components/sections/index.ts`:
- `HeroSection` — full-viewport hero with gradient overlay, bottom-pinned headline + dual CTAs
- `ConceptSection` — centered text over background image with overlay
- `TrackAthleteSection` — SplitGrid with two linked portrait cards
- `WhatWeDoSection` — SplitGrid with text left + image right on white bg
- `EmailSubscribe` — black bg email capture with pill-shaped input

---

## Platform Theme (Dark)

Used in the `(platform)` route group — dashboard, feed, profile, record, events.

### Colors
| Role | Value |
|---|---|
| Background | `#141115` |
| Surface (cards) | `#1A1719` or `#1E1B1F` |
| Surface hover | `#2A272C` |
| Border | `#3A373C` |
| Accent / lime | `#F5F5F5` |
| Text primary | `#FFFFFF` |
| Text muted | `#6B6870` |
| Text disabled | `#A09EA3` |
| Error | `#FF4D4D` |

### Typography
- **All text**: `fontFamily: "'DM Sans', sans-serif"` — always set via inline style
- **Section labels**: `text-[10px] font-semibold tracking-[0.3em] uppercase text-[#F5F5F5]`
- **Page headers**: `text-[13px] font-semibold text-white` (DM Sans, `-0.01em` letterSpacing)
- **Muted metadata**: `text-[12px] text-[#6B6870]` (DM Sans)
- **Body content**: `text-[13px] text-[#6B6870] leading-relaxed` (DM Sans)

### Page Layout
```tsx
<div className="min-h-screen bg-[#141115] px-6 py-10">
  <div className="max-w-2xl mx-auto">
    {/* content */}
  </div>
</div>
```

### Form Convention
- Use `InputDark`, `TextAreaDark`, `SelectDark` — **never** light-mode variants in platform pages
- Stack inputs with `space-y-6` inside `<form>`
- Submit button: `px-6 py-3 bg-[#F5F5F5] text-[#141115] text-[13px] font-bold uppercase tracking-[0.15em]`
- Success message: `text-[#F5F5F5]`, error message: `text-[#FF4D4D]`
