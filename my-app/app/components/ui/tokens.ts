// ─────────────────────────────────────────────
// NATUREHOODOFFICIAL — DESIGN TOKENS
// ⚠️  AUTO-GENERATED from brand/tokens/*.json
// ⚠️  Do not edit — run: npm run brand:build
// Typography: Sk Modernist (display) + DM Sans (everything else)
// ─────────────────────────────────────────────

export const tokens = {
  font: {
    display: "'Sk Modernist', sans-serif",
    body: "'DM Sans', sans-serif",
    heading: "'DM Sans', sans-serif",  // alias: h3+ headings use body font
  },
  color: {
    ink: '#141115',
    black: '#000000',
    cloud: '#F5F5F5',
    surface1: '#1E1B1F',
    surface2: '#2B282C',
    cardBg: '#1A1719',
    border: '#3D3940',
    muted: '#E8E8E8',
    accent: '#F5F5F5',
    textPrimary: '#FFFFFF',
    textSecondary: '#6B6870',
    mutedForeground: '#847E89',
    textDisabled: '#A09EA3',
    error: '#FF4D4D',
    warning: '#F5A623',
    info: '#4DA6FF',
    white: '#FFFFFF',
  },
  aspectRatio: {
    hero: '16/9',
    landscape: '3/2',
    portraitCard: '4/5',
    tallProfile: '2/3',
    square: '1/1',
  },
  spacing: {
    section: "py-6 md:py-[30px]",
    sectionSm: "py-8 sm:py-10 md:py-12 lg:py-16",
    container: "px-4 sm:px-6 md:px-8 lg:px-12",
  },
  textSpacing: {
    lineHeight: {
      tight: "1.1",
      snug: "1.3",
      normal: "1.6",
      relaxed: "1.75",
      loose: "2.0",
    },
    paragraph: {
      tight: "0.75rem",
      normal: "1rem",
      relaxed: "1.5rem",
      loose: "2rem",
    },
    letterSpacing: {
      tighter: "-0.02em",
      tight: "-0.015em",
      normal: "-0.01em",
      wide: "0.05em",
      wider: "0.1em",
      widest: "0.3em",
    },
    section: {
      xs: "2rem",
      sm: "3rem",
      md: "4rem",
      lg: "6rem",
      xl: "8rem",
    },
  },
  typography: {
    hero: {
      fontFamily: "'Sk Modernist', sans-serif",
      fontSize: "clamp(52px, 9vw, 96px)",
      fontWeight: "700",
      lineHeight: "0.95",
      letterSpacing: "-0.02em",
      marginBottom: "1.5rem",
    },
    h1: {
      fontFamily: "'Sk Modernist', sans-serif",
      fontSize: "clamp(38px, 5.5vw, 60px)",
      fontWeight: "700",
      lineHeight: "1",
      letterSpacing: "-0.02em",
      marginBottom: "1.25rem",
    },
    h2: {
      fontFamily: "'Sk Modernist', sans-serif",
      fontSize: "clamp(26px, 4vw, 40px)",
      fontWeight: "700",
      lineHeight: "1.05",
      letterSpacing: "-0.015em",
      marginBottom: "1rem",
    },
    h3: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "clamp(20px, 3vw, 28px)",
      fontWeight: "600",
      lineHeight: "1.1",
      letterSpacing: "-0.01em",
      marginBottom: "0.75rem",
    },
    label: {
      fontFamily: "'Sk Modernist', sans-serif",
      fontSize: "11px",
      fontWeight: "400",
      lineHeight: "1.4",
      letterSpacing: "0.04em",
      textTransform: "uppercase" as const,
    },
    body: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "16px",
      fontWeight: "400",
      lineHeight: "1.75",
      letterSpacing: "-0.2px",
      marginBottom: "1.5625rem",
    },
    bodyLarge: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "18px",
      fontWeight: "400",
      lineHeight: "1.75",
      letterSpacing: "0",
      marginBottom: "1.25rem",
    },
    small: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "13px",
      fontWeight: "400",
      lineHeight: "1.65",
      letterSpacing: "0",
      marginBottom: "0.75rem",
    },
    caption: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "11px",
      fontWeight: "400",
      lineHeight: "1.5",
      letterSpacing: "0.06em",
      marginBottom: "0.5rem",
    },
  },
  responsive: {
    text: {
      hero: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
      h1: "text-4xl sm:text-5xl md:text-6xl",
      h2: "text-3xl sm:text-4xl md:text-5xl",
      h3: "text-xl sm:text-2xl md:text-3xl",
      body: "text-sm sm:text-base",
      small: "text-xs sm:text-sm",
    },
  },
} as const;
