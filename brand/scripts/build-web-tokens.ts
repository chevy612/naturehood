/**
 * build-web-tokens.ts
 * Reads brand/tokens/*.json → generates my-app/app/components/ui/tokens.ts
 *
 * Run: npx tsx brand/scripts/build-web-tokens.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "../..");
const TOKENS = resolve(ROOT, "brand/tokens");
const OUT = resolve(ROOT, "my-app/app/components/ui/tokens.ts");

// Read source JSON
const colors = JSON.parse(readFileSync(resolve(TOKENS, "colors.json"), "utf-8"));
const typo = JSON.parse(readFileSync(resolve(TOKENS, "typography.json"), "utf-8"));
const spacing = JSON.parse(readFileSync(resolve(TOKENS, "spacing.json"), "utf-8"));

// Build color entries
const colorEntries = Object.entries(colors)
  .filter(([k]) => !k.startsWith("$"))
  .map(([k, v]: [string, any]) => `    ${k}: '${v.value}',`)
  .join("\n");

// Build font entries — include 'heading' alias pointing to body font (DM Sans)
// since h3+ headings now use DM Sans in the 2-font system
const fontEntries = [
  ...Object.entries(typo.fonts)
    .map(([k, v]: [string, any]) => `    ${k}: "'${v.value}', sans-serif",`),
  `    heading: "'${typo.fonts.body.value}', sans-serif",  // alias: h3+ headings use body font`,
].join("\n");

// Build typography scale entries
function buildTypoEntry(key: string, t: any): string {
  const family = typo.fonts[t.family];
  const lines = [
    `      fontFamily: "'${family.value}', sans-serif",`,
    `      fontSize: "${t.size}",`,
    `      fontWeight: "${t.weight}",`,
    `      lineHeight: "${t.lineHeight}",`,
    `      letterSpacing: "${t.letterSpacing}",`,
  ];
  if (t.textTransform) lines.push(`      textTransform: "${t.textTransform}" as const,`);
  // Add marginBottom based on scale
  const margins: Record<string, string> = {
    hero: "1.5rem", h1: "1.25rem", h2: "1rem", h3: "0.75rem",
    body: "1.5625rem", bodyLarge: "1.25rem", small: "0.75rem", caption: "0.5rem",
  };
  if (margins[key]) lines.push(`      marginBottom: "${margins[key]}",`);
  return `    ${key}: {\n${lines.join("\n")}\n    },`;
}

const typoEntries = Object.entries(typo.scale)
  .map(([k, v]) => buildTypoEntry(k, v))
  .join("\n");

// Build spacing entries
const spacingEntries = `    section: "${spacing.section.web.normal}",
    sectionSm: "py-8 sm:py-10 md:py-12 lg:py-16",
    container: "px-4 sm:px-6 md:px-8 lg:px-12",`;

// Build textSpacing (preserve existing structure)
const textSpacingBlock = `  textSpacing: {
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
  },`;

// Build responsive entries
const responsiveBlock = `  responsive: {
    text: {
      hero: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
      h1: "text-4xl sm:text-5xl md:text-6xl",
      h2: "text-3xl sm:text-4xl md:text-5xl",
      h3: "text-xl sm:text-2xl md:text-3xl",
      body: "text-sm sm:text-base",
      small: "text-xs sm:text-sm",
    },
  },`;

// Assemble output
const output = `// ─────────────────────────────────────────────
// NATUREHOODOFFICIAL — DESIGN TOKENS
// ⚠️  AUTO-GENERATED from brand/tokens/*.json
// ⚠️  Do not edit — run: npm run brand:build
// Typography: Sk Modernist (display) + DM Sans (everything else)
// ─────────────────────────────────────────────

export const tokens = {
  font: {
${fontEntries}
  },
  color: {
${colorEntries}
  },
  spacing: {
${spacingEntries}
  },
${textSpacingBlock}
  typography: {
${typoEntries}
  },
${responsiveBlock}
} as const;
`;

writeFileSync(OUT, output, "utf-8");
console.log(`✓ Generated ${OUT}`);
