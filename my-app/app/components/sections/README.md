# Sections Folder

This folder contains **complete page sections** with their data and logic in one place for easy maintenance.

## Structure

Each section file contains:
- **Content data** (text, images, links)
- **Component logic** (React component)

## Why This Approach?

✅ **Easy Maintenance** - All related code in one file
✅ **Self-Contained** - No hunting for data across files
✅ **Reusable** - Import and use anywhere
✅ **Clear Ownership** - One file = one section

## Usage

### Option 1: Direct Import
```tsx
import HowWeWorkSection from '@/app/components/sections/how-we-work';

<HowWeWorkSection />
```

### Option 2: Named Import (via index.ts)
```tsx
import { HowWeWorkSection } from '@/app/components/sections';

<HowWeWorkSection />
```

## Creating New Sections

1. Create a new file in this folder (e.g., `testimonials.tsx`)
2. Follow this structure:

```tsx
"use client";

// Content Data
const TESTIMONIALS_DATA = [
  { name: "John Doe", quote: "...", role: "..." },
  // ... more items
];

// Component
export default function TestimonialsSection() {
  return (
    <section>
      {TESTIMONIALS_DATA.map(item => (
        // ... render items
      ))}
    </section>
  );
}
```

3. Export it in `index.ts`:
```tsx
export { default as TestimonialsSection } from './testimonials';
```

## Current Sections

- **HeroSection** (`Hero.tsx`) — Full-width hero with background video, title, CTAs, and optional stats row. Also exports `HeroTemplate` for reuse on other pages.
- **IntroSection** (`Introduction.tsx`) — Brief intro paragraph with a CTA link to the about page.
- **HowWeWorkSection** (`how-we-work.tsx`) — 3-step process using `MediaContentBlock`. Alternating dark/light backgrounds and left/right layouts.
- **EmailSubscribe** (`email-subscribe.tsx`) — Email capture form backed by Supabase.

## Design System

All sections use:
- Inter font for headings
- DM Sans for body text and labels
- Tailwind for layout and spacing
