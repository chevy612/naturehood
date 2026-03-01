import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────
// RESERVED SLUGS
// Must stay in sync with all routes in the app/
// so that no username can shadow a real page.
// ─────────────────────────────────────────────

export const RESERVED_SLUGS = new Set([
  // App routes
  'home', 'dashboard', 'profile', 'settings',
  // Marketing routes
  'business', 'team', 'about', 'privacy', 'terms', 'cookies',
  // Auth routes
  'signup', 'login', 'auth',
  // Dev / internal
  'testing', 'api',
  // Brand protection
  'naturehood', 'admin', 'support', 'help', 'blog', 'press',
])

// ─────────────────────────────────────────────
// GENERATE UNIQUE USERNAME
// Normalizes a full name into a lowercase alphanumeric
// slug, checks DB for conflicts, and appends a random
// 2-digit suffix if taken (up to 10 retries).
// ─────────────────────────────────────────────

export async function generateUniqueUsername(fullName: string): Promise<string> {
  const admin = createAdminClient()

  const base = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') || 'user'

  // Build candidate list: base first, then suffixed variants
  const candidates: string[] = [base]
  for (let i = 0; i < 10; i++) {
    const suffix = Math.floor(10 + Math.random() * 90).toString()
    candidates.push(base + suffix)
  }
  // Timestamp fallback — virtually guaranteed to be unique
  candidates.push(base + Date.now().toString().slice(-6))

  for (const candidate of candidates) {
    if (RESERVED_SLUGS.has(candidate)) continue

    const { data } = await admin
      .from('profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle()

    if (!data) return candidate
  }

  // Should never reach here
  return base + Date.now().toString().slice(-6)
}
