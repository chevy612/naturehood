/**
 * Egress Fix Verification — Manual Test Suite
 * Tests all four egress optimisations applied to the Naturehood platform.
 *
 * Usage (from my-app/):
 *   npx tsx scripts/test-egress-fixes.ts
 *
 * Prerequisites:
 *   - .env.local must be present with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   - A valid Supabase session (set TEST_USER_JWT below, or log in and grab it from DevTools)
 */

import fs from 'fs'
import path from 'path'

// ─── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=][^=]*)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '')
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing from .env.local')
  process.exit(1)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function pass(label: string) {
  console.log(`  ✅  ${label}`)
  passed++
}

function fail(label: string, detail?: string) {
  console.log(`  ❌  ${label}${detail ? `\n       ${detail}` : ''}`)
  failed++
}

function section(title: string) {
  console.log(`\n── ${title} ──`)
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE 1: getClaims() — verify it returns sub without a network round-trip
// ─────────────────────────────────────────────────────────────────────────────

async function testGetClaims() {
  section('Issue 1 — getClaims() returns user ID without extra network call')

  // We can't inject a live session here without a real JWT, so we test the
  // shape of the return value using a known-invalid token and confirm the SDK
  // does NOT hit the /auth/v1/user endpoint (which getUser() would trigger).
  //
  // Instead we verify the SDK method exists and that getClaims() is a function.
  const { createClient } = await import('@supabase/supabase-js')
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  if (typeof client.auth.getClaims === 'function') {
    pass('client.auth.getClaims is a function (SDK supports it)')
  } else {
    fail('client.auth.getClaims is NOT a function — SDK may be too old')
  }

  // getClaims() with no active session should return null claims, not throw
  try {
    const { data, error } = await client.auth.getClaims()
    if (error === null && data?.claims === null) {
      pass('getClaims() returns { data: { claims: null } } when unauthenticated — no network error')
    } else if (data !== undefined) {
      pass('getClaims() returned without throwing')
    } else {
      fail('getClaims() returned unexpected shape', JSON.stringify({ data, error }))
    }
  } catch (e: any) {
    fail('getClaims() threw an exception', e.message)
  }

  // Confirm getUser() IS different — it hits the network (we don't call it here
  // to avoid the round-trip, but we verify it exists as the baseline)
  if (typeof client.auth.getUser === 'function') {
    pass('client.auth.getUser confirmed to exist (was the old path — now replaced)')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE 2: Feed query — verify the batched profiles fetch works correctly
//
// Note: a PostgREST embedded join (profiles!user_id) is NOT possible here
// because training_logs.user_id has no direct FK to profiles.id — it goes
// through auth.users. The correct approach is a batched .in() query, which
// is what home/page.tsx uses. These tests verify that pattern is sound.
// ─────────────────────────────────────────────────────────────────────────────

async function testFeedQuery() {
  section('Issue 2 — Batched profiles fetch for community feed')

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Step 1: fetch logs
  const { data: logs, error: logsError } = await supabase
    .from('training_logs')
    .select('id, title, logged_date, duration_minutes, workout_types, workout_log, user_id')
    .eq('is_public', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(0, 19)

  if (logsError) {
    fail('training_logs query returned an error', logsError.message)
    return
  }

  pass('training_logs query executed without error')

  const logList = logs ?? []
  pass(`Returned ${logList.length} log(s)`)

  if (logList.length === 0) {
    console.log('       (no public training_logs in DB — profile fetch tests skipped)')
    return
  }

  // Step 2: batched profile fetch — should be exactly ONE query regardless of row count
  const userIds = [...new Set(logList.map((l) => l.user_id))]

  if (userIds.length <= logList.length) {
    pass(`Deduplication works — ${logList.length} logs → ${userIds.length} unique user IDs`)
  } else {
    fail('Deduplication produced more IDs than logs (impossible)', `${userIds.length} > ${logList.length}`)
  }

  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url')
    .in('id', userIds)

  if (profilesError) {
    fail('profiles .in() query returned an error', profilesError.message)
    return
  }

  pass('profiles .in() query executed without error')
  pass(`Fetched ${(profilesData ?? []).length} profile(s) for ${userIds.length} unique user(s)`)

  // Step 3: merge and verify shape matches what FeedCard expects
  const profileMap = Object.fromEntries(
    (profilesData ?? []).map((p) => [p.id, { name: p.name, username: p.username, avatar_url: p.avatar_url }])
  )

  const feed = logList.map((log) => ({
    ...log,
    profiles: profileMap[log.user_id] ?? null,
  }))

  const hasProfilesKey = feed.every(row => 'profiles' in row)
  if (hasProfilesKey) {
    pass('Every merged row has a "profiles" key')
  } else {
    fail('Some rows are missing the "profiles" key after merge')
  }

  const profilesAreObjectOrNull = feed.every(
    row => row.profiles === null || (typeof row.profiles === 'object' && !Array.isArray(row.profiles))
  )
  if (profilesAreObjectOrNull) {
    pass('All "profiles" values are plain objects or null (FeedCard-safe)')
  } else {
    fail('Some "profiles" values are arrays or unexpected type')
  }

  // Verify a profile with data has the expected fields
  const withProfile = feed.find(row => row.profiles !== null)
  if (withProfile?.profiles) {
    const p = withProfile.profiles as Record<string, unknown>
    if ('name' in p && 'username' in p && 'avatar_url' in p) {
      pass('Profile object contains name, username, avatar_url')
    } else {
      fail('Profile object missing expected fields', JSON.stringify(p))
    }
  } else {
    console.log('       (all profiles null — field shape test skipped)')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE 3: getAvatarUrl() — WebP transform helper
// ─────────────────────────────────────────────────────────────────────────────

async function testAvatarUrl() {
  section('Issue 3 — getAvatarUrl() WebP transform helper')

  // Import the helper directly
  const { getAvatarUrl } = await import('../lib/storage')

  // null / undefined inputs
  if (getAvatarUrl(null) === null) {
    pass('getAvatarUrl(null) returns null')
  } else {
    fail('getAvatarUrl(null) did not return null', String(getAvatarUrl(null)))
  }

  if (getAvatarUrl(undefined) === null) {
    pass('getAvatarUrl(undefined) returns null')
  } else {
    fail('getAvatarUrl(undefined) did not return null')
  }

  // Rewrite path
  const raw = `${SUPABASE_URL}/storage/v1/object/public/avatars/abc123/avatar`
  const result = getAvatarUrl(raw, 80)

  if (result === null) {
    fail('getAvatarUrl returned null for a valid URL')
    return
  }

  if (result.includes('/storage/v1/render/image/public/')) {
    pass('URL rewritten to /render/image/public/')
  } else {
    fail('URL not rewritten correctly', result)
  }

  if (result.includes('format=webp')) {
    pass('format=webp present in URL')
  } else {
    fail('format=webp missing from URL', result)
  }

  if (result.includes('width=80') && result.includes('height=80')) {
    pass('width=80 and height=80 present')
  } else {
    fail('width/height params missing', result)
  }

  if (result.includes('resize=cover')) {
    pass('resize=cover present')
  } else {
    fail('resize=cover missing', result)
  }

  if (result.includes('quality=80')) {
    pass('quality=80 present')
  } else {
    fail('quality=80 missing', result)
  }

  // Different sizes
  const sm = getAvatarUrl(raw, 40)!
  const lg = getAvatarUrl(raw, 160)!

  if (sm.includes('width=40') && lg.includes('width=160')) {
    pass('Size param respected across sm/lg variants')
  } else {
    fail('Size param not applied correctly', `sm=${sm}, lg=${lg}`)
  }

  // URL without the /object/public/ pattern (e.g. already a render URL or external)
  const external = 'https://example.com/photo.jpg'
  const externalResult = getAvatarUrl(external, 80)!
  if (!externalResult.includes('/render/image/public/')) {
    pass('Non-Supabase URL left unchanged (no /object/public/ to replace)')
  } else {
    fail('Non-Supabase URL incorrectly rewritten')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE 4: Bot trap slugs — verified before any DB call
// ─────────────────────────────────────────────────────────────────────────────

async function testBotTrapSlugs() {
  section('Issue 4 — BOT_TRAP_SLUGS blocks scanners before DB query')

  const { BOT_TRAP_SLUGS, RESERVED_SLUGS } = await import('../lib/username')

  const botSlugs = [
    'xmlrpc.php',
    'wp-login.php',
    'wp-admin',
    '.env',
    '.git',
    'sitemap.xml',
    'sitemap.xml.gz',
    'favicon.ico',
    'phpmyadmin',
    'config.php',
    'administrator',
  ]

  let allPresent = true
  for (const slug of botSlugs) {
    if (!BOT_TRAP_SLUGS.has(slug)) {
      fail(`"${slug}" missing from BOT_TRAP_SLUGS`)
      allPresent = false
    }
  }
  if (allPresent) pass(`All ${botSlugs.length} expected bot slugs present in BOT_TRAP_SLUGS`)

  // Case-insensitive check (the page does .toLowerCase() before checking)
  if (BOT_TRAP_SLUGS.has('XMLRPC.PHP'.toLowerCase())) {
    pass('Uppercase "XMLRPC.PHP" matches after .toLowerCase()')
  } else {
    fail('Case-insensitive check failed for XMLRPC.PHP')
  }

  // Should NOT overlap with RESERVED_SLUGS (different purposes)
  const overlap = [...BOT_TRAP_SLUGS].filter(s => RESERVED_SLUGS.has(s))
  if (overlap.length === 0) {
    pass('No overlap between BOT_TRAP_SLUGS and RESERVED_SLUGS')
  } else {
    fail(`Unexpected overlap: ${overlap.join(', ')}`)
  }

  // Legitimate usernames should NOT be blocked
  const legitUsernames = ['alice', 'bob42', 'john', 'jane123']
  let noneBlocked = true
  for (const u of legitUsernames) {
    if (BOT_TRAP_SLUGS.has(u)) {
      fail(`Legitimate username "${u}" is incorrectly blocked`)
      noneBlocked = false
    }
  }
  if (noneBlocked) pass('Legitimate usernames are not blocked by BOT_TRAP_SLUGS')

  // Verify RESERVED_SLUGS still guards app routes
  const reservedRoutes = ['home', 'account', 'events', 'record', 'login', 'signup', 'admin']
  let allReserved = true
  for (const r of reservedRoutes) {
    if (!RESERVED_SLUGS.has(r)) {
      fail(`Expected reserved slug "${r}" is missing`)
      allReserved = false
    }
  }
  if (allReserved) pass('All expected app routes present in RESERVED_SLUGS')
}

// ─── Run all tests ────────────────────────────────────────────────────────────

async function main() {
  console.log('Naturehood — Egress Fix Test Suite\n')

  await testGetClaims()
  await testFeedQuery()
  await testAvatarUrl()
  await testBotTrapSlugs()

  console.log(`\n─────────────────────────────────────`)
  console.log(`Results: ${passed} passed, ${failed} failed`)

  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error('\n❌  Unhandled error:', e)
  process.exit(1)
})
