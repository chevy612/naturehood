// ─────────────────────────────────────────────
// LANDING IMAGES — single source of truth
// Photos live in the public Supabase Storage bucket `landing`.
// To swap a photo: replace the file in the bucket (same name) — no redeploy.
// Bump `?v=N` only if you need to bust the CDN cache after overwriting.
// ─────────────────────────────────────────────

const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/landing`;

export const landingImages = {
  hero: `${base}/hero.jpg`,
  concept: `${base}/concept.jpg`,
  trackMeet: `${base}/track-meet.jpg?v=2`,
  athletes: `${base}/athletes.jpg`,
  whatWeDo: `${base}/what-we-do.jpg`,
} as const;
