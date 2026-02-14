# Integration Guide - New Navigation & Footer

Quick guide to integrate your new layout components.

## 🎯 Quick Start (3 Steps)

### Step 1: Update Your Layout File

Open your main layout file and import the new components:

```tsx
// app/layout.tsx or app/components/ConditionalLayout.tsx

import Navigation from '@/app/components/layout/navigation';
import Footer from '@/app/components/layout/footer';

export default function Layout({ children }) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#141115]">
        {children}
      </main>
      <Footer />
    </>
  );
}
```

### Step 2: Remove Old Navigation Import

If you had old navigation:

```tsx
// ❌ Remove this
import OldNavbar from '@/app/components/navigation';

// ✅ Use this instead
import Navigation from '@/app/components/layout/navigation';
```

### Step 3: Test

```bash
npm run dev
```

Visit `http://localhost:3000` and verify:
- ✅ Navigation appears at top
- ✅ Mobile menu works (try on mobile/resize browser)
- ✅ User authentication shows correctly
- ✅ Footer appears at bottom

---

## 📋 Before & After

### Before (Old Structure)

```
app/components/
├── navigation.tsx        ← Old navigation
├── hero.tsx
├── footer.tsx           ← Old footer (if exists)
└── basic/
    └── basic.tsx
```

### After (New Structure)

```
app/components/
├── layout/                    ← NEW: Layout components
│   ├── navigation.tsx         ← Modern navigation
│   ├── footer.tsx             ← Modern footer
│   └── README.md
├── basic/
│   ├── basic.tsx              ← UI primitives
│   └── COMPONENT-GUIDE.md
├── hero.tsx                   ← Feature components
└── [other components]
```

---

## 🔧 Customization Options

### Update Navigation Links

Edit `app/components/layout/navigation.tsx`:

```tsx
const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Athletes", href: "/athletes" },    // ← Add new
  { label: "Brands", href: "/brands" },        // ← Add new
  { label: "Contact", href: "/contact" },      // ← Add new
];
```

### Update Footer Links

Edit `app/components/layout/footer.tsx`:

```tsx
const footerLinks = {
  product: [
    { label: "Your Link", href: "/your-page" },  // ← Customize
  ],
  // ... more sections
};
```

### Change Social Media Links

```tsx
const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/YOUR_HANDLE", label: "Instagram" },
  // ... update with your actual social links
];
```

---

## ✨ What's New in the Navigation?

### Visual Improvements
- ✅ Smoother animations (300ms transitions)
- ✅ Backdrop blur effect on sticky scroll
- ✅ Better hover states
- ✅ Consistent spacing using `Container`

### Functionality
- ✅ Better keyboard navigation (ESC to close)
- ✅ Auto body scroll lock on mobile menu
- ✅ Improved dropdown animations
- ✅ Better TypeScript types

### Code Quality
- ✅ Uses design system components from `basic.tsx`
- ✅ Follows your color tokens
- ✅ Clean, maintainable code structure
- ✅ Proper semantic HTML

---

## 🎨 Design System Usage

The new components automatically use your design tokens:

```tsx
// Colors
bg-[#141115]           // tokens.color.ink
text-[#C8F04D]         // tokens.color.accent
border-[#3A373C]       // tokens.color.border

// Fonts
fontFamily: tokens.font.display    // Syne
fontFamily: tokens.font.body       // DM Sans

// Components
<Container>            // From basic.tsx
<ButtonAccent>         // From basic.tsx
```

---

## 🐛 Troubleshooting

### Navigation doesn't appear
- Check that you've imported it in your layout file
- Verify the import path is correct: `@/app/components/layout/navigation`

### Logo doesn't show
- Ensure `/naturehood.svg` exists in your `public/` folder
- Or update the image path in the navigation component

### Supabase auth not working
- Verify `@/lib/supabase/client` is set up correctly
- Check environment variables for Supabase

### Mobile menu doesn't close
- Clear browser cache
- Check for JavaScript errors in console

### Styling looks different
- Make sure Tailwind config includes the new component paths
- Run `npm run dev` to rebuild

---

## 📱 Mobile Testing Checklist

- [ ] Mobile menu opens smoothly
- [ ] Mobile menu closes on link click
- [ ] Mobile menu closes on backdrop click
- [ ] Mobile menu closes on ESC key
- [ ] Body scroll is locked when menu is open
- [ ] Navigation is sticky on scroll
- [ ] User dropdown works on mobile
- [ ] Footer is responsive

---

## 🚀 Performance Tips

The new navigation is optimized for performance:

- Uses CSS transitions (GPU accelerated)
- Minimal re-renders with proper React hooks
- Lazy background blur (only when sticky)
- Optimized click-outside handling

---

## 📞 Need Help?

If you run into issues:

1. Check the console for errors
2. Verify all imports are correct
3. Ensure Supabase is configured
4. Review the README.md in the layout folder
5. Check that your logo file exists

---

## 🎯 Next Steps

After integration:

1. ✅ Test on desktop and mobile
2. ✅ Update navigation links for your app
3. ✅ Update footer with your actual links
4. ✅ Customize social media links
5. ✅ Add more pages to your navigation
6. ✅ Consider adding a search bar (optional)
7. ✅ Add analytics tracking (optional)

---

Happy building! 🌿
