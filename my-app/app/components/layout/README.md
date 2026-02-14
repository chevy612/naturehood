# Layout Components

This folder contains structural layout components that are used once across your application.

## 📂 Structure

```
layout/
├── navigation.tsx    ← Main navigation bar with auth
├── footer.tsx        ← Site-wide footer
└── README.md         ← This file
```

## 🎯 What Goes Here?

Layout components are **structural** and **singular** components used to build your app's skeleton:

✅ **Include:**
- Navigation bars
- Footers
- Sidebars
- Page wrappers
- Auth layouts

❌ **Don't Include:**
- Reusable UI components (→ use `basic/basic.tsx`)
- Feature-specific components (→ create `features/` folder)
- Page components (→ use `app/` routes)

---

## 🧭 Navigation Component

Modern, responsive navigation bar with authentication state management.

### Features
- ✅ Responsive mobile menu with smooth animations
- ✅ Authentication state (shows user menu when logged in)
- ✅ Uses design system from `basic.tsx`
- ✅ Keyboard accessible (ESC to close)
- ✅ Auto body scroll lock when mobile menu is open
- ✅ Backdrop blur effect

### Usage

```tsx
import Navigation from '@/app/components/layout/navigation';

export default function RootLayout({ children }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
```

### Customization

Edit navigation items in the component:

```tsx
const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "For Business", href: "/business" },
];
```

---

## 🦶 Footer Component

Site-wide footer with links and social media.

### Features
- ✅ Multi-column responsive layout
- ✅ Social media links
- ✅ Organized link sections (Product, Company, Resources, Legal)
- ✅ Uses design system tokens
- ✅ Automatically shows current year

### Usage

```tsx
import Footer from '@/app/components/layout/footer';

export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
```

### Customization

Edit footer links in the component:

```tsx
const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    // ... add more
  ],
  // ... other sections
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/...", label: "Instagram" },
  // ... add more
];
```

---

## 🏗️ Complete Layout Example

Here's how to use both components together:

```tsx
// app/layout.tsx
import Navigation from '@/app/components/layout/navigation';
import Footer from '@/app/components/layout/footer';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

---

## 🎨 Design System Integration

Both components use:
- **Colors:** `tokens.color` from `basic.tsx`
- **Fonts:** `tokens.font.display` and `tokens.font.body`
- **Components:** `Container`, `ButtonAccent`, `ButtonGhost`

This ensures visual consistency across your entire application.

---

## 🔄 Migration from Old Navigation

If you're migrating from the old navigation component:

### Old Location
`app/components/navigation.tsx`

### New Location
`app/components/layout/navigation.tsx`

### Update Imports

```tsx
// ❌ Old
import Navigation from '@/app/components/navigation';

// ✅ New
import Navigation from '@/app/components/layout/navigation';
```

### Benefits of New Navigation
- Cleaner code structure
- Better animations
- Uses design system components
- Improved accessibility
- Better TypeScript types

---

## 🚀 Next Steps

1. **Update your root layout** to use the new navigation and footer
2. **Remove old navigation** component if no longer needed
3. **Customize links** to match your site structure
4. **Test on mobile** to ensure smooth animations

---

## 📝 Notes

- Navigation uses **Supabase auth** - ensure `@/lib/supabase/client` is configured
- Logo path is `/naturehood.svg` - update if your logo is elsewhere
- Colors match your `basic.tsx` design tokens
- All transitions use **Tailwind's duration classes** for consistency
