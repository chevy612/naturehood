# Sections Folder

This folder contains **complete page sections** with their data and logic in one place for easy maintenance.

## Structure

Each section file contains:
- **Content data** (text, images, links)
- **Component logic** (React component)
- **Usage examples** (commented at bottom)

## Why This Approach?

✅ **Easy Maintenance** - All related code in one file
✅ **Self-Contained** - No hunting for data across files
✅ **Reusable** - Import and use anywhere
✅ **Clear Ownership** - One file = one section

## Usage

### Option 1: Direct Import
```tsx
import HowWeWorkSection from '@/app/components/sections/HowWeWork';

<HowWeWorkSection />
```

### Option 2: Named Import (via index.ts)
```tsx
import { HowWeWorkSection } from '@/app/components/sections';

<HowWeWorkSection />
```

## Creating New Sections

1. Create a new file in this folder (e.g., `Testimonials.tsx`)
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
export { default as TestimonialsSection } from './Testimonials';
```

## Current Sections

- **HowWeWorkSection** - 3-step process showing how NatureHood works
  - Uses MediaContentBlock component
  - Alternating dark/light backgrounds
  - Alternating left/right layouts
  - Fully responsive

## Design System

All sections use:
- Typography tokens from `@/app/components/basic/basic`
- Spacing utilities from `globals.css`
- Inter font for headings
- DM Sans font for body text
- Optimal line-height (1.75) and max-width (65ch) for readability
