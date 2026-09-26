// ─────────────────────────────────────────────
// LANDING IMAGES — single source of truth
// Photos are served from `my-app/public/images/landing/`, so they ship with
// the deploy on every environment (no Supabase bucket, no env var, no signed keys).
// To swap a photo: replace the file in that folder (same name) and redeploy.
// ─────────────────────────────────────────────

const base = "/images/landing";

export const landingImages = {
  hero: `${base}/hero.jpg`,
  concept: `${base}/concept.jpg`,
  trackMeet: `${base}/track-meet.jpg`,
  athletes: `${base}/athletes.jpg`,
  whatWeDo: `${base}/what-we-do.jpg`,
} as const;
