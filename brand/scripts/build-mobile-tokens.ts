/**
 * build-mobile-tokens.ts
 * Reads brand/tokens/typography.json → generates brand/dist/typography.native.ts
 * A React Native StyleSheet-ready typography object for the naturehood-mobile app.
 *
 * Run: npx tsx brand/scripts/build-mobile-tokens.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "../..");
const TOKENS = resolve(ROOT, "brand/tokens");
const OUT_DIR = resolve(ROOT, "brand/dist");
const OUT = resolve(OUT_DIR, "typography.native.ts");

const typo = JSON.parse(readFileSync(resolve(TOKENS, "typography.json"), "utf-8"));

// weight (numeric) → mobile family key used in typography.json fonts.*.mobile
const WEIGHT_KEY: Record<number, string> = {
  300: "light",
  400: "regular",
  500: "medium",
  600: "semibold",
  700: "bold",
  800: "extrabold",
};

// Resolve the Expo-loaded font family name for a scale token's family + weight.
function mobileFontFamily(family: string, weight: number): string {
  const mobile = typo.fonts[family].mobile;
  const key = WEIGHT_KEY[weight];
  // display only ships regular/bold — fall back to the nearest available
  return mobile[key] ?? mobile[weight >= 700 ? "bold" : "regular"];
}

// RN letterSpacing is an absolute number (px). Convert the web string:
//   "-0.02em" → em × fontSize   |   "-0.3px" → -0.3   |   "0" → 0
function mobileLetterSpacing(value: string | undefined, fontSize: number): number {
  if (!value) return 0;
  const v = value.trim();
  if (v.endsWith("em")) return Math.round(parseFloat(v) * fontSize * 100) / 100;
  if (v.endsWith("px")) return parseFloat(v);
  return parseFloat(v) || 0;
}

function buildMobileEntry(key: string, t: any): string {
  const fontSize: number = t.fontSize.mobile ?? t.fontSize.min;
  const fontFamily = mobileFontFamily(t.family, t.weight);
  // RN needs an absolute line-height (px), not a unitless multiplier
  const lineHeight = Math.round(t.lineHeight * fontSize);
  const letterSpacing = mobileLetterSpacing(t.letterSpacing, fontSize);

  const lines = [
    `    fontFamily: "${fontFamily}",`,
    `    fontSize: ${fontSize},`,
    `    fontWeight: "${t.weight}" as const,`,
    `    lineHeight: ${lineHeight},`,
    `    letterSpacing: ${letterSpacing},`,
  ];
  if (t.textTransform) lines.push(`    textTransform: "${t.textTransform}" as const,`);
  return `  ${key}: {\n${lines.join("\n")}\n  },`;
}

const entries = Object.entries(typo.scale)
  .map(([k, v]) => buildMobileEntry(k, v))
  .join("\n");

const output = `// ─────────────────────────────────────────────
// NATUREHOODOFFICIAL — MOBILE TYPOGRAPHY TOKENS
// ⚠️  AUTO-GENERATED from brand/tokens/typography.json
// ⚠️  Do not edit — run: npm run brand:build:mobile
// React Native TextStyle values (absolute px sizes/line-heights).
// Fonts loaded in the app via @expo-google-fonts / expo-font.
// ─────────────────────────────────────────────

export const typography = {
${entries}
} as const;

export type TypographyToken = keyof typeof typography;
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, output, "utf-8");
console.log(`✓ Generated ${OUT}`);
