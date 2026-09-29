// Generate email-safe PNG logos from the brand SVGs.
// Gmail/Outlook/Yahoo don't render SVG, so emails reference these PNGs by absolute URL.
// Run once (committed output): `node scripts/gen-email-logos.mjs`
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const outDir = join(publicDir, "email");
mkdirSync(outDir, { recursive: true });

// White wordmark (667×77) → retina PNG, shown at 180px in email. density rasterizes the
// vector at higher DPI so the downscaled PNG stays crisp.
await sharp(join(publicDir, "naturehood.svg"), { density: 600 })
  .resize({ width: 360 })
  .png()
  .toFile(join(outDir, "wordmark.png"));
console.log("✓ wordmark.png (360px)");

// Brand mark: icon.svg composites the emblem (a transparent base64 PNG) on a #141115 circle
// plate. For email we want the emblem WITHOUT that circle background, so pull the embedded
// PNG directly (it's already transparent) instead of rasterizing the whole icon.
const iconSvg = readFileSync(join(publicDir, "icon.svg"), "utf8");
const match = iconSvg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
if (!match) throw new Error("Could not find embedded emblem PNG in icon.svg");
const emblem = Buffer.from(match[1], "base64");
await sharp(emblem)
  .resize({ width: 320 }) // wide emblem (~2.9:1); shown at 60px in email
  .png()
  .toFile(join(outDir, "mark.png"));
console.log("✓ mark.png (320px, no circle background)");
