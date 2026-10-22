/**
 * One-off: copy a single athlete's training data from PROD → DEV.
 *
 * Copies jccman's (prod) training tree + meals onto the dev `chevycheung`
 * account, preserving every internal id/relationship and only rewriting
 * `user_id`. Social / notifications / follows / push tokens / subscriptions
 * / AI-usage are intentionally NOT copied (they reference other users).
 *
 * The data flows prod -> this process -> dev directly over HTTPS; it never
 * passes through anything else.
 *
 * Credentials:
 *   DEV  — read from .env.local  (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 *   PROD — read from .env.migrate (PROD_SUPABASE_SERVICE_ROLE_KEY [+ optional PROD_SUPABASE_URL])
 *
 * Run:  npx tsx scripts/copy-user-prod-to-dev.ts
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// --- load env files (same lightweight parse the other scripts use) ---
function loadEnv(file: string) {
  try {
    const txt = readFileSync(resolve(process.cwd(), file), 'utf8')
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  } catch {
    /* file optional */
  }
}
loadEnv('.env.local')
loadEnv('.env.migrate')

// --- identities (verified against both databases) ---
const SRC_USER = '35c660cc-84a4-4efb-ad65-312b0e1722da' // prod  jccman
const DST_USER = 'c52879e4-9f81-45ff-a2dc-a99407ff8291' // dev   chevycheung

const DEV_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const DEV_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const PROD_URL = process.env.PROD_SUPABASE_URL ?? 'https://vddlfdngjtcoxcyuvkbd.supabase.co'
const PROD_KEY = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY ?? ''

// --- hard safety guards: never write to prod, never read the wrong project ---
const DEV_REF = 'jkaucsreqaywqxjwvteh'
const PROD_REF = 'vddlfdngjtcoxcyuvkbd'
function abort(msg: string): never {
  console.error(`❌  ${msg}`)
  process.exit(1)
}
if (!DEV_URL || !DEV_KEY) abort('Missing dev creds (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) in .env.local')
if (!PROD_KEY) abort('Missing PROD_SUPABASE_SERVICE_ROLE_KEY — add it to my-app/.env.migrate')
if (!DEV_URL.includes(DEV_REF)) abort(`DEV_URL does not point at the dev project (${DEV_REF}). Refusing to run — got ${DEV_URL}`)
if (!PROD_URL.includes(PROD_REF)) abort(`PROD_URL does not point at the prod project (${PROD_REF}). Got ${PROD_URL}`)
if (DEV_URL === PROD_URL) abort('DEV_URL and PROD_URL are identical. Refusing to run.')

const prod: SupabaseClient = createClient(PROD_URL, PROD_KEY, { auth: { persistSession: false } })
const dev: SupabaseClient = createClient(DEV_URL, DEV_KEY, { auth: { persistSession: false } })

// Insert order: parents before children (FK-safe). Delete uses the reverse.
const ORDER = [
  'training_logs',
  'session_details',
  'session_blocks',
  'sprint_efforts',
  'competition_results',
  'physio_body_areas',
  'meal_records',
  'session_exercises', // -> session_blocks
  'sprint_reps', // -> sprint_efforts
  'competition_rounds', // -> competition_results
  'exercise_sets', // -> session_exercises
] as const

// training_logs rows are large (jsonb AI reports) -> smaller insert batches.
const INSERT_CHUNK: Record<string, number> = { training_logs: 25 }
const DEFAULT_CHUNK = 500

async function readAll(table: string): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = []
  const page = 1000
  for (let from = 0; ; from += page) {
    const { data, error } = await prod
      .from(table)
      .select('*')
      .eq('user_id', SRC_USER)
      .range(from, from + page - 1)
    if (error) abort(`[prod ${table}] read failed: ${error.message}`)
    out.push(...(data as Record<string, unknown>[]))
    if (!data || data.length < page) break
  }
  return out
}

async function run() {
  console.log(`▶  copy ${SRC_USER} (prod) -> ${DST_USER} (dev)\n`)

  // 1) clear chevycheung's existing rows in dev (child -> parent), idempotent.
  console.log('— clearing existing dev rows for chevycheung —')
  for (const table of [...ORDER].reverse()) {
    const { error } = await dev.from(table).delete().eq('user_id', DST_USER)
    if (error) abort(`[dev ${table}] delete failed: ${error.message}`)
    console.log(`  cleared ${table}`)
  }

  // 2) copy prod -> dev (parent -> child), remapping user_id.
  console.log('\n— copying prod -> dev —')
  const summary: { table: string; copied: number }[] = []
  for (const table of ORDER) {
    const rows = await readAll(table)
    for (const r of rows) r.user_id = DST_USER
    const chunk = INSERT_CHUNK[table] ?? DEFAULT_CHUNK
    for (let i = 0; i < rows.length; i += chunk) {
      const batch = rows.slice(i, i + chunk)
      const { error } = await dev.from(table).insert(batch)
      if (error) abort(`[dev ${table}] insert failed at row ${i}: ${error.message}`)
    }
    summary.push({ table, copied: rows.length })
    console.log(`  ${table}: ${rows.length}`)
  }

  // 3) verify dev counts match what we inserted.
  console.log('\n— verifying dev counts —')
  let ok = true
  for (const { table, copied } of summary) {
    const { count, error } = await dev
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', DST_USER)
    if (error) abort(`[dev ${table}] count failed: ${error.message}`)
    const match = count === copied
    ok &&= match
    console.log(`  ${match ? '✓' : '✗'} ${table}: dev=${count} expected=${copied}`)
  }

  console.log(ok ? '\n✅  done — all tables match.' : '\n⚠️  done, but some counts differ (see above).')
  if (!ok) process.exit(1)
}

run().catch((e) => abort(e?.message ?? String(e)))
