/**
 * validate-tokens.ts
 * Verifies that generated web tokens stay in sync with brand/tokens/*.json source.
 *
 * Run: npx tsx brand/scripts/validate-tokens.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = resolve(import.meta.dirname, "../..");
const TOKENS = resolve(ROOT, "brand/tokens");

let errors = 0;
let warnings = 0;

function error(msg: string) { console.error(`  ✗ ${msg}`); errors++; }
function warn(msg: string) { console.warn(`  ⚠ ${msg}`); warnings++; }
function ok(msg: string) { console.log(`  ✓ ${msg}`); }

// ── Validate JSON token sources ──────────────────────────────

console.log("\n🔍 Validating brand token sources...\n");

const requiredFiles = ["colors.json", "typography.json", "spacing.json", "radii.json", "motion.json"];
for (const file of requiredFiles) {
  const path = resolve(TOKENS, file);
  if (!existsSync(path)) {
    error(`Missing token file: brand/tokens/${file}`);
    continue;
  }
  try {
    JSON.parse(readFileSync(path, "utf-8"));
    ok(`brand/tokens/${file} — valid JSON`);
  } catch (e) {
    error(`brand/tokens/${file} — invalid JSON: ${e}`);
  }
}

// ── Validate color token values ──────────────────────────────

console.log("\n🎨 Validating color tokens...\n");

const colors = JSON.parse(readFileSync(resolve(TOKENS, "colors.json"), "utf-8"));
const hexRegex = /^#[0-9A-Fa-f]{6}$/;

for (const [key, val] of Object.entries(colors)) {
  if (key.startsWith("$")) continue;
  const v = val as any;
  if (!v.value) { error(`Color "${key}" missing value`); continue; }
  if (!hexRegex.test(v.value)) { error(`Color "${key}" has invalid hex: ${v.value}`); continue; }
  if (!v.description) { warn(`Color "${key}" missing description`); continue; }
  ok(`${key}: ${v.value}`);
}

// ── Validate typography scale (portable, cross-platform) ─────

console.log("\n🔤 Validating typography scale...\n");

const typoSource = JSON.parse(readFileSync(resolve(TOKENS, "typography.json"), "utf-8"));

for (const [key, val] of Object.entries(typoSource.scale)) {
  const t = val as any;
  const fs = t.fontSize;
  if (!fs || typeof fs.min !== "number") {
    error(`Scale "${key}" missing numeric fontSize.min`);
    continue;
  }
  if ((fs.max !== undefined || fs.fluid !== undefined) && !(fs.max && fs.fluid)) {
    error(`Scale "${key}" is fluid but must define both fontSize.max and fontSize.fluid`);
    continue;
  }
  if (!typoSource.fonts[t.family]) {
    error(`Scale "${key}" references unknown font family "${t.family}"`);
    continue;
  }
  ok(`${key}: ${fs.max ? `clamp ${fs.min}–${fs.max}px` : `${fs.min}px`} · mobile ${fs.mobile ?? fs.min}px`);
}

// ── Check generated web tokens exist and contain source colors ──

console.log("\n🌐 Checking web tokens sync...\n");

const webTokensPath = resolve(ROOT, "my-app/app/components/ui/tokens.ts");
if (!existsSync(webTokensPath)) {
  warn("Web tokens not generated yet — run: npm run brand:build:web");
} else {
  const webContent = readFileSync(webTokensPath, "utf-8");
  let syncErrors = 0;

  for (const [key, val] of Object.entries(colors)) {
    if (key.startsWith("$")) continue;
    const v = val as any;
    if (!webContent.includes(v.value)) {
      error(`Web tokens missing color ${key} (${v.value})`);
      syncErrors++;
    }
  }

  if (syncErrors === 0) ok("All source colors present in web tokens");

  // Check font system
  const typo = JSON.parse(readFileSync(resolve(TOKENS, "typography.json"), "utf-8"));
  for (const [, font] of Object.entries(typo.fonts) as [string, any][]) {
    if (!webContent.includes(font.value)) {
      error(`Web tokens missing font "${font.value}"`);
    }
  }
  // Warn if Inter is still referenced (should have been removed)
  if (webContent.includes("'Inter'") && !webContent.includes("// legacy")) {
    warn("Web tokens still reference Inter — should use DM Sans for everything except display");
  }
}

// ── Summary ──────────────────────────────────────────────────

console.log("\n" + "─".repeat(50));
if (errors > 0) {
  console.error(`\n❌ Validation failed: ${errors} error(s), ${warnings} warning(s)\n`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n⚠️  Validation passed with ${warnings} warning(s)\n`);
} else {
  console.log(`\n✅ All tokens valid and in sync\n`);
}
