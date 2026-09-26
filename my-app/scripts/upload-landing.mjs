// Upload landing-page photos to the public Supabase Storage bucket `landing`.
//
// Usage (from my-app/):  node --env-file=.env.local scripts/upload-landing.mjs
//
// Reads the 5 images from public/images/landing/ and uploads them with upsert,
// so re-running replaces existing files. Creates the bucket (public) if missing.
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public", "images", "landing");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env. Run with:  node --env-file=.env.local scripts/upload-landing.mjs"
  );
  process.exit(1);
}

const BUCKET = "landing";
const FILES = [
  "hero.jpg",
  "concept.jpg",
  "track-meet.jpg",
  "athletes.jpg",
  "what-we-do.jpg",
];

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function ensureBucket() {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });
  if (error && !/already exists/i.test(error.message)) throw error;
  console.log(`Bucket "${BUCKET}" ready (public).`);
}

async function uploadAll() {
  for (const name of FILES) {
    const bytes = await readFile(join(publicDir, name));
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(name, bytes, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
    console.log(`✓ ${name}  →  ${data.publicUrl}`);
  }
}

await ensureBucket();
await uploadAll();
console.log("Done.");
