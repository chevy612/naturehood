# NatureHood Component Library - Quick Reference

## 🎯 Overview
This component library provides everything you need to build responsive landing pages quickly without repetitive styling.

## 📦 Import Components

```tsx
import {
  // Buttons
  ButtonPrimary,
  ButtonSecondary,
  ButtonGhost,
  ButtonAccent,
  ButtonIcon,

  // Forms
  InputField,
  TextArea,
  SelectField,
  Checkbox,

  // UI Elements
  PillTag,

  // Layout Components
  Container,
  Section,
  Stack,
  Grid,

  // Section Templates
  HeroTemplate,
  FeatureSection,
  StatsSection,
  CTASection,

  // CTA Components
  CTAEmailCapture,
  CTAApplicationForm,

  // Tokens
  tokens,
} from '@/app/components/basic/basic';
```

---

## 🎨 Design Tokens

### Colors
```tsx
tokens.color.ink        // #141115 - Dark background
tokens.color.cloud      // #F5F5F5 - Light background
tokens.color.accent     // #C8F04D - Electric lime
tokens.color.surface1   // #1E1B1F - Dark surface
tokens.color.surface2   // #2A272C - Darker surface
```

### Responsive Text Sizes
```tsx
tokens.responsive.text.h1        // "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
tokens.responsive.text.h2        // "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
tokens.responsive.text.body      // "text-sm sm:text-base md:text-lg"
```

### Spacing
```tsx
tokens.spacing.section     // "py-12 sm:py-16 md:py-20 lg:py-24"
tokens.spacing.container   // "px-4 sm:px-6 md:px-8 lg:px-12"
```

---

## 📐 Layout Components

### Container
Wraps content with max-width and responsive padding.

```tsx
<Container>
  <h1>Your content here</h1>
</Container>

<Container className="bg-gray-100">
  Custom background
</Container>
```

### Section
Adds consistent vertical spacing around content blocks.

```tsx
<Section>
  <Container>
    Section content
  </Container>
</Section>

<Section className="bg-[#1E1B1F]" id="features">
  Dark section with ID
</Section>
```

### Stack
Vertical spacing between elements.

```tsx
<Stack spacing={4}>
  <h1>Title</h1>
  <p>Paragraph</p>
  <button>CTA</button>
</Stack>

// Spacing options: 2, 3, 4, 6, 8, 10, 12
```

### Grid
Responsive grid layouts.

```tsx
<Grid cols={{ default: 1, md: 2, lg: 3 }} gap={6}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

---

## 🎭 Section Templates

### HeroTemplate
Main hero section with background video/image.

```tsx
<HeroTemplate
  title="Your Headline Here"
  subtitle="Supporting text that explains your value proposition"
  backgroundVideo="https://your-video-url.mp4"
  // OR backgroundImage="https://your-image-url.jpg"
  primaryCTA={<ButtonAccent>Get Started</ButtonAccent>}
  secondaryCTA={<ButtonSecondary>Learn More</ButtonSecondary>}
/>
```

### FeatureSection
Display features in a grid.

```tsx
<FeatureSection
  title="Why Choose Us"
  subtitle="Everything you need to succeed"
  columns={3}
  features={[
    {
      icon: <YourIcon size={32} />,
      title: 'Feature Name',
      description: 'Feature description here',
    },
    // ... more features
  ]}
/>
```

### StatsSection
Display key metrics.

```tsx
<StatsSection
  stats={[
    { value: '10K+', label: 'Active Users' },
    { value: '500+', label: 'Partners' },
    { value: '$2M+', label: 'Revenue' },
    { value: '98%', label: 'Satisfaction' },
  ]}
/>
```

### CTASection
Call-to-action with buttons.

```tsx
<CTASection
  headline="Ready to Get Started?"
  subtext="Join thousands of users building something amazing"
  variant="dark" // or "light"
  primaryCTA={<ButtonAccent>Sign Up Now</ButtonAccent>}
  secondaryCTA={<ButtonGhost>Learn More</ButtonGhost>}
/>
```

---

## 🔘 Buttons

### ButtonPrimary
Main CTAs with animated underline.

```tsx
<ButtonPrimary onClick={() => console.log('clicked')}>
  Apply Now
</ButtonPrimary>

<ButtonPrimary disabled fullWidth>
  Loading...
</ButtonPrimary>
```

### ButtonSecondary
Outline style for secondary actions.

```tsx
<ButtonSecondary onClick={handleClick}>
  Learn More
</ButtonSecondary>
```

### ButtonAccent
Electric lime for hero CTAs.

```tsx
<ButtonAccent fullWidth>
  Join NatureHood
</ButtonAccent>
```

### ButtonGhost
Minimal text links.

```tsx
<ButtonGhost onClick={handleClick}>
  View Projects
</ButtonGhost>
```

### ButtonIcon
Square icon buttons.

```tsx
<ButtonIcon
  icon={<XIcon />}
  label="Close"
  variant="outline" // or "solid", "ghost"
  onClick={handleClose}
/>
```

---

## 📝 Form Components

### InputField
```tsx
<InputField
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  hint="We'll never share your email"
/>
```

### TextArea
```tsx
<TextArea
  label="Your Message"
  placeholder="Tell us more..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={4}
  error={errors.message}
/>
```

### SelectField
```tsx
<SelectField
  label="Role"
  options={[
    { value: 'athlete', label: 'Athlete' },
    { value: 'brand', label: 'Brand' },
  ]}
  value={role}
  onChange={(e) => setRole(e.target.value)}
  placeholder="Select your role"
/>
```

### Checkbox
```tsx
<Checkbox
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

---

## 🏷️ UI Elements

### PillTag
```tsx
<PillTag label="Trail Running" />
<PillTag label="Active" variant="active" />
<PillTag label="Featured" variant="accent" />
<PillTag label="Remove Me" onRemove={() => console.log('removed')} />
```

---

## 🚀 Quick Landing Page Template

```tsx
import Link from 'next/link';
import {
  HeroTemplate,
  FeatureSection,
  CTASection,
  ButtonAccent,
  ButtonSecondary,
} from '@/app/components/basic/basic';

export default function LandingPage() {
  return (
    <main>
      <HeroTemplate
        title="Your Amazing Product"
        subtitle="Solve problems and delight customers"
        backgroundVideo="/hero-video.mp4"
        primaryCTA={<Link href="/signup"><ButtonAccent>Get Started</ButtonAccent></Link>}
        secondaryCTA={<Link href="/about"><ButtonSecondary>Learn More</ButtonSecondary></Link>}
      />

      <FeatureSection
        title="Why Choose Us"
        features={[
          { title: 'Fast', description: 'Lightning quick performance' },
          { title: 'Secure', description: 'Bank-level security' },
          { title: 'Scalable', description: 'Grows with your business' },
        ]}
      />

      <CTASection
        headline="Ready to Start?"
        primaryCTA={<Link href="/signup"><ButtonAccent>Sign Up Free</ButtonAccent></Link>}
      />
    </main>
  );
}
```

---

## ✅ Best Practices

1. **Always use Container inside Section**
   ```tsx
   <Section>
     <Container>
       {/* Your content */}
     </Container>
   </Section>
   ```

2. **Use section templates for common patterns**
   - Don't reinvent hero sections, use `HeroTemplate`
   - Don't custom-build feature grids, use `FeatureSection`

3. **Leverage responsive tokens**
   ```tsx
   // Instead of:
   className="text-lg md:text-xl lg:text-2xl"

   // Use:
   className={tokens.responsive.text.body}
   ```

4. **Consistent spacing**
   - Use `Section` for vertical spacing between blocks
   - Use `Stack` for spacing within components
   - Use `Grid` for responsive layouts

5. **Mobile-first approach**
   - All components are responsive by default
   - Test on mobile first, then larger screens

---

## 📱 Responsive Breakpoints

```tsx
// Tailwind default breakpoints
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
```

---

## 🎨 Font Usage

```tsx
// Headlines and buttons
style={{ fontFamily: "'Syne', sans-serif" }}

// Body text and descriptions
style={{ fontFamily: "'DM Sans', sans-serif" }}
```

---

## 📚 Example Pages

See working examples:
- `/testing/landing-demo` - Full landing page demo
- `/design-system` - Component preview page (at bottom of basic.tsx)

---

## 🔄 Migration Checklist

When updating old pages to use the new system:

- [ ] Replace custom containers with `<Container>`
- [ ] Replace custom section wrappers with `<Section>`
- [ ] Replace old button classes with Button components
- [ ] Use section templates (HeroTemplate, FeatureSection, etc.)
- [ ] Replace hardcoded responsive classes with tokens
- [ ] Use Grid/Stack for layouts instead of custom flex/grid
