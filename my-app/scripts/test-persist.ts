/**
 * persistNormalizedSession — Integration Test Suite
 * Verifies all 9 normalized tables are populated correctly across 10 session types.
 *
 * Usage (from my-app/):
 *   npm run test:persist
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   TEST_USER_ID  (optional — falls back to first user in auth.users)
 */

import fs from 'fs'
import path from 'path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { persistNormalizedSession } from '../lib/services/session-persist'
import type { AthleteSessionLog, SprintEffort } from '../lib/types'

// ─── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=][^=]*)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '')
  }
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  process.exit(1)
}

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string> {
  if (process.env.TEST_USER_ID) return process.env.TEST_USER_ID
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
  if (error || !data.users.length) {
    console.error('❌  No users found. Set TEST_USER_ID in .env.local')
    process.exit(1)
  }
  return data.users[0].id
}

async function createDummyLog(userId: string, title: string): Promise<string> {
  const { data, error } = await supabase
    .from('training_logs')
    .insert({
      user_id: userId,
      title: `[TEST] ${title}`,
      logged_date: '2026-01-01',
      is_public: false,
      is_deleted: true,
      like_count: 0,
    })
    .select('id')
    .single()
  if (error || !data) throw new Error(`Failed to create dummy log: ${error?.message}`)
  return data.id
}

async function count(table: string, logId: string, extra?: Record<string, unknown>): Promise<number> {
  let q = supabase.from(table).select('*', { count: 'exact', head: true }).eq('training_log_id', logId)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v === null) q = q.is(k, null)
      else q = q.eq(k, v)
    }
  }
  const { count: n, error } = await q
  if (error) throw new Error(`count(${table}): ${error.message}`)
  return n ?? 0
}

type Expectation = Record<string, number>

async function runTest(
  idx: number,
  name: string,
  session: AthleteSessionLog,
  expectations: Expectation,
  userId: string,
  collectedIds: string[]
): Promise<boolean> {
  const label = `[${idx}/10] ${name}`
  const dots = '.'.repeat(Math.max(2, 48 - label.length))

  let logId: string
  try {
    logId = await createDummyLog(userId, name)
    collectedIds.push(logId)
  } catch (e) {
    console.log(`${label} ${dots} ❌ FAIL (could not create log: ${e})`)
    return false
  }

  const result = await persistNormalizedSession(supabase, logId, userId, session)
  if (result?.error) {
    console.log(`${label} ${dots} ❌ FAIL (persist error: ${result.error})`)
    return false
  }

  const failures: string[] = []
  for (const [tableKey, expected] of Object.entries(expectations)) {
    const [table, ...filterParts] = tableKey.split('|')
    const extra: Record<string, unknown> = {}
    for (const part of filterParts) {
      const [k, v] = part.split('=')
      extra[k] = v === 'null' ? null : v
    }
    const actual = await count(table, logId, Object.keys(extra).length ? extra : undefined)
    if (actual !== expected) {
      failures.push(`  ${table}${filterParts.length ? ` (${filterParts.join(',')})` : ''}: expected ${expected}, got ${actual}`)
    }
  }

  if (failures.length) {
    console.log(`${label} ${dots} ❌ FAIL`)
    failures.forEach((f) => console.log(f))
    return false
  }

  console.log(`${label} ${dots} ✅ PASS`)
  return true
}

// ─── Test Cases ───────────────────────────────────────────────────────────────

const SUMMARY_BASE = {
  total_volume_kg: null,
  total_sets: null,
  total_reps: null,
  total_distance_m: null,
  total_work_duration_seconds: null,
  estimated_intensity: null,
  session_notes: null,
  parser_confidence: 0.95,
  parsing_warnings: [],
}

// ── Case 1: strength-simple ───────────────────────────────────────────────────
// 1 block, 3 exercises, 4 sets each. All indices explicit.
const case1: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'strength',
  perceived_intensity: 'high',
  summary: { ...SUMMARY_BASE, total_volume_kg: 4860, total_sets: 12, session_notes: 'Big compound day' },
  blocks: [{
    block_index: 0,
    block_type: 'main',
    exercises: [
      {
        exercise_index: 0, name: 'Back Squat', category: 'strength', equipment: 'barbell',
        sets: [
          { set_index: 0, weight_kg: 100, reps: 5 },
          { set_index: 1, weight_kg: 110, reps: 5 },
          { set_index: 2, weight_kg: 120, reps: 3 },
          { set_index: 3, weight_kg: 120, reps: 3 },
        ],
      },
      {
        exercise_index: 1, name: 'Bench Press', category: 'strength', equipment: 'barbell',
        sets: [
          { set_index: 0, weight_kg: 80, reps: 6 },
          { set_index: 1, weight_kg: 85, reps: 5 },
          { set_index: 2, weight_kg: 90, reps: 4 },
          { set_index: 3, weight_kg: 90, reps: 4, is_failure: true },
        ],
      },
      {
        exercise_index: 2, name: 'Deadlift', category: 'strength', equipment: 'barbell',
        sets: [
          { set_index: 0, weight_kg: 60, reps: 5, is_warmup: true },
          { set_index: 1, weight_kg: 140, reps: 5 },
          { set_index: 2, weight_kg: 160, reps: 3 },
          { set_index: 3, weight_kg: 180, reps: 1 },
        ],
      },
    ],
  }],
}

// ── Case 2: strength-multi-block ──────────────────────────────────────────────
// 3 blocks: warmup (2×1), main (4×4), cooldown (2×1). Mixed equipment.
const case2: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'strength',
  readiness: { feel: 'good', pain_score: 0, notes: null },
  summary: { ...SUMMARY_BASE },
  blocks: [
    {
      block_index: 0, block_type: 'warmup', block_name: 'Warm-up',
      exercises: [
        { exercise_index: 0, name: 'Banded Hip Circle', category: 'mobility', equipment: 'resistance_band', sets: [{ set_index: 0, reps: 15 }] },
        { exercise_index: 1, name: 'Goblet Squat', category: 'strength', equipment: 'kettlebell', sets: [{ set_index: 0, weight_kg: 16, reps: 10 }] },
      ],
    },
    {
      block_index: 1, block_type: 'main', block_name: 'Main Lifts',
      exercises: [
        { exercise_index: 0, name: 'Front Squat', category: 'strength', equipment: 'barbell', sets: [{ set_index: 0, weight_kg: 80, reps: 5 }, { set_index: 1, weight_kg: 90, reps: 4 }, { set_index: 2, weight_kg: 95, reps: 3 }, { set_index: 3, weight_kg: 100, reps: 2 }] },
        { exercise_index: 1, name: 'Romanian Deadlift', category: 'strength', equipment: 'barbell', sets: [{ set_index: 0, weight_kg: 90, reps: 8 }, { set_index: 1, weight_kg: 100, reps: 8 }, { set_index: 2, weight_kg: 100, reps: 7 }, { set_index: 3, weight_kg: 100, reps: 7 }] },
        { exercise_index: 2, name: 'Leg Press', category: 'strength', equipment: 'machine', sets: [{ set_index: 0, weight_type: 'machine_level', machine_level: 8, reps: 12 }, { set_index: 1, weight_type: 'machine_level', machine_level: 10, reps: 10 }, { set_index: 2, weight_type: 'machine_level', machine_level: 10, reps: 10 }, { set_index: 3, weight_type: 'machine_level', machine_level: 12, reps: 8 }] },
        { exercise_index: 3, name: 'Pull-up', category: 'strength', equipment: 'bodyweight', sets: [{ set_index: 0, weight_type: 'bodyweight', reps: 8 }, { set_index: 1, weight_type: 'bodyweight', reps: 7 }, { set_index: 2, weight_type: 'bodyweight', reps: 6 }, { set_index: 3, weight_type: 'bodyweight', reps: 6 }] },
      ],
    },
    {
      block_index: 2, block_type: 'cooldown', block_name: 'Cool-down',
      exercises: [
        { exercise_index: 0, name: 'Hip Flexor Stretch', category: 'mobility', equipment: null, sets: [{ set_index: 0, duration_seconds: 60 }] },
        { exercise_index: 1, name: 'Hamstring Stretch', category: 'mobility', equipment: null, sets: [{ set_index: 0, duration_seconds: 60 }] },
      ],
    },
  ],
}

// ── Case 3: strength-superset-emom ────────────────────────────────────────────
// EMOM block (60s, 3 exercises × 5 sets) + superset block (2 pairs × 4 sets)
const case3: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'strength',
  summary: { ...SUMMARY_BASE },
  blocks: [
    {
      block_index: 0, block_type: 'emom', block_name: '12min EMOM', emom_interval_seconds: 60,
      exercises: [
        { exercise_index: 0, name: 'Power Clean', category: 'olympic_lift', equipment: 'barbell', sets: Array.from({ length: 5 }, (_, i) => ({ set_index: i, weight_kg: 70, reps: 3 })) },
        { exercise_index: 1, name: 'Box Jump', category: 'plyometric', equipment: 'bodyweight', sets: Array.from({ length: 5 }, (_, i) => ({ set_index: i, reps: 5 })) },
        { exercise_index: 2, name: 'Plank', category: 'core', equipment: 'bodyweight', sets: Array.from({ length: 5 }, (_, i) => ({ set_index: i, duration_seconds: 30 })) },
      ],
    },
    {
      block_index: 1, block_type: 'superset', block_name: 'Superset A',
      exercises: [
        { exercise_index: 0, name: 'Sentadilla Búlgara', name_original: 'Bulgarian Split Squat', equipment: 'barbell', laterality: 'unilateral_left', is_superset_with: 1, sets: Array.from({ length: 4 }, (_, i) => ({ set_index: i, weight_kg: 50, reps: 10 })) },
        { exercise_index: 1, name: 'Nordic Hamstring Curl', name_unknown: true, equipment: 'bodyweight', is_superset_with: 0, sets: Array.from({ length: 4 }, (_, i) => ({ set_index: i, reps: 6 })) },
      ],
    },
  ],
}

// ── Case 4: conditioning-circuit ─────────────────────────────────────────────
// 1 circuit block, circuit_rounds: 4, 5 exercises tracking time/distance
const case4: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'conditioning',
  perceived_intensity: 'max',
  summary: { ...SUMMARY_BASE, total_distance_m: 2400 },
  blocks: [{
    block_index: 0, block_type: 'circuit', block_name: 'HYROX Sim', circuit_rounds: 4,
    exercises: [
      { exercise_index: 0, name: 'SkiErg', category: 'cardio', equipment: 'machine', sets: Array.from({ length: 4 }, (_, i) => ({ set_index: i, distance_m: 1000, duration_seconds: 240 })) },
      { exercise_index: 1, name: 'Sled Push', category: 'cardio', equipment: 'sled', sets: Array.from({ length: 4 }, (_, i) => ({ set_index: i, distance_m: 50, weight_kg: 75 })) },
      { exercise_index: 2, name: 'Burpee Broad Jump', category: 'plyometric', equipment: 'bodyweight', sets: Array.from({ length: 4 }, (_, i) => ({ set_index: i, reps: 30, distance_m: 30 })) },
      { exercise_index: 3, name: 'Rowing', category: 'cardio', equipment: 'machine', sets: Array.from({ length: 4 }, (_, i) => ({ set_index: i, distance_m: 1000, duration_seconds: 220 })) },
      { exercise_index: 4, name: 'Farmers Carry', category: 'strength', equipment: 'kettlebell', sets: Array.from({ length: 4 }, (_, i) => ({ set_index: i, weight_kg: 32, distance_m: 200 })) },
    ],
  }],
}

// ── Case 5: sprint-block-starts ───────────────────────────────────────────────
// 3 block_start efforts × 3 reps, splits and wind readings
const case5: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'sprint',
  perceived_intensity: 'max',
  summary: { ...SUMMARY_BASE, total_distance_m: 270 },
  sprint_session: {
    surface: 'track',
    footwear: 'spikes',
    conditions: '+0.8 m/s wind',
    efforts: [
      {
        effort_index: 0, drill_type: 'block_start', distance_m: 30, effort_percent: 95, sets: 3,
        reps: [
          { rep_index: 0, time_seconds: 3.85, split_times_seconds: [1.82, 1.21, 0.82], wind_ms: 0.8, completed: true },
          { rep_index: 1, time_seconds: 3.81, split_times_seconds: [1.80, 1.19, 0.82], wind_ms: 0.9, completed: true },
          { rep_index: 2, time_seconds: 3.79, split_times_seconds: [1.78, 1.19, 0.82], wind_ms: 0.7, completed: true },
        ],
      },
      {
        effort_index: 1, drill_type: 'block_start', distance_m: 30, effort_percent: 98, sets: 3,
        reps: [
          { rep_index: 0, time_seconds: 3.76, wind_ms: 1.0, completed: true },
          { rep_index: 1, time_seconds: 3.78, wind_ms: 0.9, completed: true },
          { rep_index: 2, time_seconds: 3.77, wind_ms: 1.1, completed: true },
        ],
      },
      {
        effort_index: 2, drill_type: 'block_start', distance_m: 30, effort_percent: 100, sets: 3,
        reps: [
          { rep_index: 0, time_seconds: 3.74, wind_ms: 0.5, completed: true },
          { rep_index: 1, time_seconds: 3.72, wind_ms: 0.6, completed: true },
          { rep_index: 2, time_seconds: 3.70, wind_ms: 0.4, completed: true },
        ],
      },
    ],
  },
}

// ── Case 6: sprint-mixed-drills (effort_index MISSING — tests fallback) ───────
// 4 efforts, all effort_index omitted. 2 reps are DNF.
const case6: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'sprint',
  perceived_intensity: 'high',
  summary: { ...SUMMARY_BASE },
  sprint_session: {
    surface: 'grass',
    footwear: 'flats',
    conditions: null,
    efforts: [
      {
        // effort_index intentionally omitted
        drill_type: 'acceleration', distance_m: 40, effort_percent: 85,
        reps: [
          { rep_index: 0, time_seconds: 5.20, completed: true },
          { rep_index: 1, time_seconds: 5.15, completed: true },
        ],
      } as SprintEffort,
      {
        drill_type: 'fly', distance_m: 30, effort_percent: 90,
        reps: [
          { rep_index: 0, time_seconds: 2.98, completed: true },
          { rep_index: 1, time_seconds: 2.95, completed: true },
          { rep_index: 2, time_seconds: 2.97, completed: true },
          { rep_index: 3, time_seconds: 2.94, completed: false }, // DNF
        ],
      } as SprintEffort,
      {
        drill_type: 'tempo', distance_m: 150, effort_percent: 75,
        reps: [
          { rep_index: 0, time_seconds: 19.2, completed: true },
          { rep_index: 1, time_seconds: 19.5, completed: true },
          { rep_index: 2, time_seconds: 20.1, completed: false }, // DNF
        ],
      } as SprintEffort,
      {
        drill_type: 'speed_endurance', distance_m: 200, effort_percent: 80,
        reps: [
          { rep_index: 0, time_seconds: 24.8, completed: true },
          { rep_index: 1, time_seconds: 25.1, completed: true },
          { rep_index: 2, time_seconds: 25.4, completed: true },
          { rep_index: 3, time_seconds: 25.9, completed: true },
          { rep_index: 4, time_seconds: 26.2, completed: true },
          { rep_index: 5, time_seconds: 26.8, completed: true },
        ],
      } as SprintEffort,
    ],
  },
}

// ── Case 7: competition-complete ──────────────────────────────────────────────
// 100m, 3 rounds (heat + semi + final), PB in final, SB in semi
const case7: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'competition',
  perceived_intensity: 'max',
  summary: { ...SUMMARY_BASE, session_notes: 'First sub-10.1 race' },
  competition_result: {
    event: '100m',
    competition_name: 'State Championships',
    venue: 'Sydney Olympic Park',
    lane: 5,
    status: 'completed',
    conditions: 'sunny, slight headwind',
    best_time_seconds: 10.08,
    rounds: [
      { round_type: 'heat',      time_seconds: 10.28, wind_ms:  0.5, ranking: 2, pb: false, sb: false },
      { round_type: 'semifinal', time_seconds: 10.15, wind_ms:  0.8, ranking: 1, pb: false, sb: true  },
      { round_type: 'final',     time_seconds: 10.08, wind_ms: -0.2, ranking: 3, pb: true,  sb: false },
    ],
  },
}

// ── Case 8: competition-dns ───────────────────────────────────────────────────
// DNS, no rounds
const case8: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'competition',
  summary: { ...SUMMARY_BASE },
  competition_result: {
    event: '200m',
    competition_name: 'Regional Open',
    status: 'dns',
    dns_reason: 'hamstring strain — scratched on warm-up',
    best_time_seconds: null,
    rounds: [],
  },
}

// ── Case 9: physio-full ───────────────────────────────────────────────────────
// 3 body areas + 4 rehab exercises (block_id = null)
const case9: AthleteSessionLog = {
  parser_version: '2.0.0',
  session_type: 'physio',
  perceived_intensity: 'low',
  summary: { ...SUMMARY_BASE, session_notes: 'Post-race recovery session' },
  physio_session: {
    provider: 'physiotherapist',
    clearance_status: 'modified_training',
    notes: 'Cleared for swimming and upper body only',
    body_areas: [
      { area: 'left hamstring', side: 'left',     injury_name: 'grade 1 strain', pain_score_before: 4, pain_score_after: 2, treatment_type: 'dry needling' },
      { area: 'right knee',     side: 'right',    injury_name: null,             pain_score_before: 2, pain_score_after: 1, treatment_type: 'massage'      },
      { area: 'lower back',     side: 'bilateral', injury_name: null,             pain_score_before: 3, pain_score_after: 1, treatment_type: 'mobilisation' },
    ],
    exercises: [
      {
        exercise_index: 0, name: 'Nordic Hamstring', category: 'strength', equipment: 'bodyweight',
        sets: [{ set_index: 0, reps: 5, notes: 'eccentric only' }, { set_index: 1, reps: 5 }, { set_index: 2, reps: 5 }],
      },
      {
        exercise_index: 1, name: 'Copenhagen Plank', category: 'core', equipment: 'bodyweight',
        sets: [{ set_index: 0, duration_seconds: 20 }, { set_index: 1, duration_seconds: 20 }, { set_index: 2, duration_seconds: 20 }],
      },
      {
        exercise_index: 2, name: 'Glute Bridge', category: 'strength', equipment: 'bodyweight',
        sets: [{ set_index: 0, reps: 15, weight_type: 'bodyweight' }, { set_index: 1, reps: 15 }, { set_index: 2, reps: 15 }, { set_index: 3, reps: 15 }],
      },
      {
        exercise_index: 3, name: 'Calf Raise', category: 'strength', equipment: 'bodyweight',
        sets: [{ set_index: 0, reps: 20 }, { set_index: 1, reps: 20 }],
      },
    ],
  },
}

// ── Case 10: edge-sparse ──────────────────────────────────────────────────────
// ALL index fields omitted. Tests every ?? idx fallback.
const case10 = {
  parser_version: '2.0.0',
  session_type: 'sprint',
  summary: { ...SUMMARY_BASE, parser_confidence: 0.55, parsing_warnings: ['effort_index missing', 'rep_index missing'] },
  sprint_session: {
    surface: null,
    footwear: null,
    conditions: null,
    efforts: [
      {
        // effort_index missing
        drill_type: 'fly', distance_m: 20,
        reps: [
          { time_seconds: 1.85 }, // rep_index missing
          { time_seconds: 1.83 },
          { time_seconds: 1.87 },
        ],
      },
      {
        // effort_index missing
        drill_type: 'acceleration', distance_m: 40,
        reps: [
          { time_seconds: 4.92 }, // rep_index missing
          { time_seconds: 4.88 },
          { time_seconds: 4.85 },
        ],
      },
    ],
  },
} as unknown as AthleteSessionLog

// ─── Test runner ──────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🧪 NATUREHOOD — persistNormalizedSession test suite')
  console.log('─'.repeat(52))

  const userId = await getUserId()
  console.log(`Using user: ${userId}\n`)

  const collectedIds: string[] = []
  let passed = 0

  const tests: Array<{ name: string; session: AthleteSessionLog; expectations: Expectation }> = [
    {
      name: 'strength-simple',
      session: case1,
      expectations: {
        'session_details':  1,
        'session_blocks':   1,
        'session_exercises': 3,
        'exercise_sets':    12,
      },
    },
    {
      name: 'strength-multi-block',
      session: case2,
      expectations: {
        'session_blocks':   3,
        'session_exercises': 8,
        'exercise_sets':    20,
      },
    },
    {
      name: 'strength-superset-emom',
      session: case3,
      expectations: {
        'session_blocks':   2,
        'session_exercises': 5,
        'exercise_sets':    22,
      },
    },
    {
      name: 'conditioning-circuit',
      session: case4,
      expectations: {
        'session_blocks':   1,
        'session_exercises': 5,
        'exercise_sets':    20,
      },
    },
    {
      name: 'sprint-block-starts',
      session: case5,
      expectations: {
        'sprint_efforts': 3,
        'sprint_reps':    9,
      },
    },
    {
      name: 'sprint-mixed-drills (effort_index omitted)',
      session: case6,
      expectations: {
        'sprint_efforts': 4,
        'sprint_reps':    15,
      },
    },
    {
      name: 'competition-complete',
      session: case7,
      expectations: {
        'competition_results': 1,
        'competition_rounds':  3,
      },
    },
    {
      name: 'competition-dns',
      session: case8,
      expectations: {
        'competition_results': 1,
        'competition_rounds':  0,
      },
    },
    {
      name: 'physio-full',
      session: case9,
      expectations: {
        'physio_body_areas':                    3,
        'session_exercises|block_id=null':      4,
        'exercise_sets':                        12,
      },
    },
    {
      name: 'edge-sparse (all indices omitted)',
      session: case10,
      expectations: {
        'sprint_efforts': 2,
        'sprint_reps':    6,
      },
    },
  ]

  for (const [i, t] of tests.entries()) {
    const ok = await runTest(i + 1, t.name, t.session, t.expectations, userId, collectedIds)
    if (ok) passed++
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  if (collectedIds.length) {
    const { error } = await supabase
      .from('training_logs')
      .delete()
      .in('id', collectedIds)
    if (error) {
      console.warn(`\n⚠️  Cleanup failed: ${error.message}`)
      console.warn('   Orphaned rows with title starting "[TEST]" may remain.')
    }
  }

  const allPass = passed === tests.length
  console.log('\n' + '─'.repeat(52))
  console.log(
    allPass
      ? `✅ ${passed}/${tests.length} passed   🧹 Test data cleaned up`
      : `❌ ${passed}/${tests.length} passed   🧹 Test data cleaned up`
  )
  console.log()

  process.exit(allPass ? 0 : 1)
}

main().catch((e) => {
  console.error('Unexpected error:', e)
  process.exit(1)
})
