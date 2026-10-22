/**
 * Seed demo training + meal data for the dev `chevycheung` account.
 *
 * Mirrors the real log pipeline: each workout writes a `training_logs` row
 * (with `ai_structured` JSONB) plus the normalized child tables
 * (session_details / blocks / exercises / sets / sprint_efforts / sprint_reps /
 * competition_results / competition_rounds / physio_body_areas) — the same
 * shape `lib/services/session-persist.ts` produces, so it renders in the
 * dashboard, the record detail view, and the AI-report panels.
 *
 * Idempotent: clears chevycheung's existing training + meal rows first, so it
 * can be re-run safely.
 *
 * DEV ONLY. Reads dev creds from .env.local and refuses to run against anything
 * other than the dev project.
 *
 * Run:  npx tsx scripts/seed-demo-data.ts
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ── env ──────────────────────────────────────────────────────────────────────
try {
  const txt = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
} catch {
  /* noop */
}

const DEV_REF = 'jkaucsreqaywqxjwvteh'
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const USER = 'c52879e4-9f81-45ff-a2dc-a99407ff8291' // dev chevycheung

if (!URL || !KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
if (!URL.includes(DEV_REF)) {
  console.error(`❌  Refusing to run: NEXT_PUBLIC_SUPABASE_URL is not the dev project (${DEV_REF}). Got ${URL}`)
  process.exit(1)
}

const db: SupabaseClient = createClient(URL, KEY, { auth: { persistSession: false } })

// ── date helpers ─────────────────────────────────────────────────────────────
const DAY = 86_400_000
function dateAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString().slice(0, 10) // YYYY-MM-DD
}
function tsAgo(days: number, hour = 18, min = 30): string {
  const d = new Date(Date.now() - days * DAY)
  d.setUTCHours(hour, min, 0, 0)
  return d.toISOString()
}

// ── session type (loose mirror of AthleteSessionLog) ───────────────────────────
type SetRow = Record<string, unknown> & { set_index: number }
type Exercise = {
  name: string
  category?: string
  equipment?: string | null
  laterality?: string | null
  notes?: string | null
  sets: SetRow[]
}
type Block = { block_name: string; block_type: string; notes?: string | null; exercises: Exercise[] }
type Session = {
  parser_version: string
  session_type: string
  session_subtype?: string | null
  perceived_intensity?: string | null
  readiness?: { feel?: string | null; pain_score?: number | null; notes?: string | null } | null
  blocks?: Block[]
  sprint_session?: {
    surface?: string | null
    footwear?: string | null
    conditions?: string | null
    efforts: {
      drill_type: string
      distance_m?: number | null
      effort_percent?: number | null
      footwear?: string | null
      rest_between_reps_seconds?: number | null
      sets?: number | null
      notes?: string | null
      reps: { time_seconds?: number | null; wind_ms?: number | null; notes?: string | null }[]
    }[]
  } | null
  competition_result?: {
    event?: string | null
    competition_name?: string | null
    venue?: string | null
    lane?: number | null
    status: string
    conditions?: string | null
    best_time_seconds?: number | null
    notes?: string | null
    rounds: {
      round_type: string
      time_seconds?: number | null
      wind_ms?: number | null
      ranking?: number | null
      pb?: boolean
      sb?: boolean
    }[]
  } | null
  physio_session?: {
    session_subtype?: string | null
    provider?: string | null
    clearance_status?: string | null
    notes?: string | null
    body_areas?: {
      area: string
      side?: string | null
      injury_name?: string | null
      pain_score_before?: number | null
      pain_score_after?: number | null
      treatment_type?: string | null
    }[]
    exercises?: Exercise[]
  } | null
  summary: Record<string, unknown>
}

type WorkoutSpec = {
  daysAgo: number
  title: string
  workout_types: string[]
  duration_minutes: number
  workout_log: string
  session: Session
}

// ── compute strength totals so the panels show numbers ─────────────────────────
function exerciseTotals(ex: Exercise) {
  let vol = 0
  let reps = 0
  let max = 0
  for (const s of ex.sets) {
    const w = (s.weight_kg as number) ?? 0
    const r = (s.reps as number) ?? 0
    vol += w * r
    reps += r
    if (w > max) max = w
  }
  return {
    total_volume_kg: vol || null,
    max_weight_kg: max || null,
    total_reps: reps || null,
    set_count: ex.sets.length,
  }
}

// ── persist one workout exactly like the real normalized pipeline ───────────────
async function persistWorkout(spec: WorkoutSpec) {
  const logId = randomUUID()
  const s = spec.session

  // training_logs (list row + ai_structured JSONB that the detail view renders)
  let err = (
    await db.from('training_logs').insert({
      id: logId,
      user_id: USER,
      title: spec.title,
      logged_date: dateAgo(spec.daysAgo),
      duration_minutes: spec.duration_minutes,
      workout_log: spec.workout_log,
      workout_types: spec.workout_types,
      is_public: true,
      is_deleted: false,
      ai_structured: s,
      ai_formatted_at: tsAgo(spec.daysAgo),
      created_at: tsAgo(spec.daysAgo),
      updated_at: tsAgo(spec.daysAgo),
    })
  ).error
  if (err) throw new Error(`training_logs: ${err.message}`)

  // session totals for the dashboard + session meta panel
  let totalVol = 0
  let totalSets = 0
  let totalReps = 0
  let totalDist = 0
  const allBlocks = [...(s.blocks ?? [])]
  for (const b of allBlocks)
    for (const ex of b.exercises) {
      const t = exerciseTotals(ex)
      totalVol += t.total_volume_kg ?? 0
      totalReps += t.total_reps ?? 0
      totalSets += ex.sets.length
    }
  for (const eff of s.sprint_session?.efforts ?? [])
    totalDist += (eff.distance_m ?? 0) * eff.reps.length

  err = (
    await db.from('session_details').insert({
      training_log_id: logId,
      user_id: USER,
      session_type: s.session_type,
      session_subtype: s.session_subtype ?? null,
      perceived_intensity: s.perceived_intensity ?? null,
      readiness_feel: s.readiness?.feel ?? null,
      readiness_pain_score: s.readiness?.pain_score ?? null,
      readiness_notes: s.readiness?.notes ?? null,
      session_notes: (s.summary.session_notes as string) ?? null,
      parser_version: s.parser_version,
      parser_confidence: (s.summary.parser_confidence as number) ?? null,
      sprint_surface: s.sprint_session?.surface ?? null,
      sprint_footwear: s.sprint_session?.footwear ?? null,
      sprint_conditions: s.sprint_session?.conditions ?? null,
      physio_provider: s.physio_session?.provider ?? null,
      physio_clearance_status: s.physio_session?.clearance_status ?? null,
      physio_notes: s.physio_session?.notes ?? null,
      total_volume_kg: totalVol || null,
      total_sets: totalSets || null,
      total_reps: totalReps || null,
      total_distance_m: totalDist || null,
    })
  ).error
  if (err) throw new Error(`session_details: ${err.message}`)

  // blocks → exercises → sets
  for (const [bi, b] of (s.blocks ?? []).entries()) {
    const blockId = randomUUID()
    err = (
      await db.from('session_blocks').insert({
        id: blockId,
        training_log_id: logId,
        user_id: USER,
        block_index: bi,
        block_name: b.block_name,
        block_type: b.block_type,
        notes: b.notes ?? null,
      })
    ).error
    if (err) throw new Error(`session_blocks: ${err.message}`)
    await persistExercises(logId, blockId, b.exercises)
  }

  // physio exercises (no block)
  if (s.physio_session?.exercises?.length) {
    await persistExercises(logId, null, s.physio_session.exercises)
  }

  // physio body areas
  if (s.physio_session?.body_areas?.length) {
    const rows = s.physio_session.body_areas.map((a, i) => ({
      training_log_id: logId,
      user_id: USER,
      area_index: i,
      area: a.area,
      side: a.side ?? null,
      injury_name: a.injury_name ?? null,
      pain_score_before: a.pain_score_before ?? null,
      pain_score_after: a.pain_score_after ?? null,
      treatment_type: a.treatment_type ?? null,
    }))
    err = (await db.from('physio_body_areas').insert(rows)).error
    if (err) throw new Error(`physio_body_areas: ${err.message}`)
  }

  // sprint efforts → reps
  for (const [ei, eff] of (s.sprint_session?.efforts ?? []).entries()) {
    const effortId = randomUUID()
    err = (
      await db.from('sprint_efforts').insert({
        id: effortId,
        training_log_id: logId,
        user_id: USER,
        effort_index: ei,
        drill_type: eff.drill_type,
        distance_m: eff.distance_m ?? null,
        effort_percent: eff.effort_percent ?? null,
        footwear: eff.footwear ?? null,
        rest_between_reps_seconds: eff.rest_between_reps_seconds ?? null,
        sets: eff.sets ?? null,
        notes: eff.notes ?? null,
      })
    ).error
    if (err) throw new Error(`sprint_efforts: ${err.message}`)
    const reps = eff.reps.map((r, ri) => ({
      effort_id: effortId,
      training_log_id: logId,
      user_id: USER,
      rep_index: ri,
      time_seconds: r.time_seconds ?? null,
      wind_ms: r.wind_ms ?? null,
      completed: true,
      notes: r.notes ?? null,
    }))
    err = (await db.from('sprint_reps').insert(reps)).error
    if (err) throw new Error(`sprint_reps: ${err.message}`)
  }

  // competition result → rounds
  if (s.competition_result) {
    const c = s.competition_result
    const compId = randomUUID()
    err = (
      await db.from('competition_results').insert({
        id: compId,
        training_log_id: logId,
        user_id: USER,
        event: c.event ?? null,
        competition_name: c.competition_name ?? null,
        venue: c.venue ?? null,
        lane: c.lane ?? null,
        status: c.status,
        conditions: c.conditions ?? null,
        best_time_seconds: c.best_time_seconds ?? null,
        notes: c.notes ?? null,
      })
    ).error
    if (err) throw new Error(`competition_results: ${err.message}`)
    const rounds = c.rounds.map((r, ri) => ({
      competition_result_id: compId,
      training_log_id: logId,
      user_id: USER,
      round_index: ri,
      round_type: r.round_type,
      time_seconds: r.time_seconds ?? null,
      wind_ms: r.wind_ms ?? null,
      ranking: r.ranking ?? null,
      pb: r.pb ?? false,
      sb: r.sb ?? false,
    }))
    err = (await db.from('competition_rounds').insert(rounds)).error
    if (err) throw new Error(`competition_rounds: ${err.message}`)
  }

  return logId
}

async function persistExercises(logId: string, blockId: string | null, exercises: Exercise[]) {
  for (const [xi, ex] of exercises.entries()) {
    const exId = randomUUID()
    const t = exerciseTotals(ex)
    const err = (
      await db.from('session_exercises').insert({
        id: exId,
        training_log_id: logId,
        user_id: USER,
        block_id: blockId,
        exercise_index: xi,
        name: ex.name,
        category: ex.category ?? null,
        equipment: ex.equipment ?? null,
        laterality: ex.laterality ?? null,
        notes: ex.notes ?? null,
        ...t,
      })
    ).error
    if (err) throw new Error(`session_exercises: ${err.message}`)
    const sets = ex.sets.map((s, si) => ({
      exercise_id: exId,
      training_log_id: logId,
      user_id: USER,
      set_index: s.set_index ?? si,
      is_warmup: (s.is_warmup as boolean) ?? false,
      is_failure: (s.is_failure as boolean) ?? false,
      is_dropset: (s.is_dropset as boolean) ?? false,
      weight_kg: (s.weight_kg as number) ?? null,
      weight_type: (s.weight_type as string) ?? (s.weight_kg != null ? 'absolute' : null),
      reps: (s.reps as number) ?? null,
      distance_m: (s.distance_m as number) ?? null,
      time_seconds: (s.time_seconds as number) ?? null,
      effort_percent: (s.effort_percent as number) ?? null,
      rest_seconds: (s.rest_seconds as number) ?? null,
      notes: (s.notes as string) ?? null,
    }))
    const err2 = (await db.from('exercise_sets').insert(sets)).error
    if (err2) throw new Error(`exercise_sets: ${err2.message}`)
  }
}

// ── small builders to keep the catalogue readable ──────────────────────────────
const str = (set_index: number, weight_kg: number | null, reps: number, extra: Partial<SetRow> = {}): SetRow => ({
  set_index,
  weight_kg,
  reps,
  ...extra,
})

// ── WORKOUT CATALOGUE (spread across the last ~8 weeks) ─────────────────────────
const WORKOUTS: WorkoutSpec[] = [
  {
    daysAgo: 1,
    title: 'Max Velocity — Flys',
    workout_types: ['Sprint', 'Max Velocity'],
    duration_minutes: 70,
    workout_log: 'Track. Spikes. 3x30m fly from 20m run-in, full recovery. Felt smooth and relaxed at top end.',
    session: {
      parser_version: 'seed-1',
      session_type: 'sprint',
      session_subtype: 'speed',
      perceived_intensity: 'max',
      readiness: { feel: 'great', pain_score: 0, notes: 'Fresh legs' },
      sprint_session: {
        surface: 'track',
        footwear: 'spikes',
        conditions: 'Dry, +0.3 m/s',
        efforts: [
          {
            drill_type: 'fly',
            distance_m: 30,
            effort_percent: 100,
            footwear: 'spikes',
            rest_between_reps_seconds: 480,
            sets: 1,
            notes: '20m run-in',
            reps: [
              { time_seconds: 2.94, wind_ms: 0.3 },
              { time_seconds: 2.9, wind_ms: 0.2 },
              { time_seconds: 2.88, wind_ms: 0.4, notes: 'Best of the day' },
            ],
          },
        ],
      },
      summary: { estimated_intensity: 'max', session_notes: 'Top speed holding well into the season.', parser_confidence: 0.94 },
    },
  },
  {
    daysAgo: 2,
    title: 'Lower Body Power',
    workout_types: ['Strength', 'Power'],
    duration_minutes: 75,
    workout_log: 'Back squat 3x3 @120, trap bar DL 3x3, hip thrust 3x6, pogo hops.',
    session: {
      parser_version: 'seed-1',
      session_type: 'strength',
      session_subtype: 'power',
      perceived_intensity: 'high',
      readiness: { feel: 'good', pain_score: 1 },
      blocks: [
        {
          block_name: 'Warm-up',
          block_type: 'warmup',
          exercises: [
            { name: 'Pogo Hops', category: 'plyometric', equipment: 'bodyweight', sets: [str(0, null, 20), str(1, null, 20)] },
            { name: 'Goblet Squat', category: 'strength', equipment: 'dumbbell', sets: [str(0, 20, 8), str(1, 20, 8)] },
          ],
        },
        {
          block_name: 'Main',
          block_type: 'main',
          exercises: [
            { name: 'Back Squat', category: 'strength', equipment: 'barbell', sets: [str(0, 60, 5, { is_warmup: true }), str(1, 100, 3), str(2, 110, 3), str(3, 120, 2)] },
            { name: 'Trap Bar Deadlift', category: 'strength', equipment: 'trap_bar', sets: [str(0, 120, 3), str(1, 140, 3), str(2, 150, 3)] },
            { name: 'Barbell Hip Thrust', category: 'strength', equipment: 'barbell', sets: [str(0, 100, 6), str(1, 100, 6), str(2, 100, 6)] },
          ],
        },
      ],
      summary: { estimated_intensity: 'high', session_notes: 'Squat moving fast at 120.', parser_confidence: 0.96 },
    },
  },
  {
    daysAgo: 4,
    title: 'Hamstring Rehab',
    workout_types: ['Physio', 'Rehab'],
    duration_minutes: 45,
    workout_log: 'Physio session. Left hamstring tightness. Soft tissue + eccentrics. Cleared for tempo.',
    session: {
      parser_version: 'seed-1',
      session_type: 'physio',
      session_subtype: 'rehab',
      perceived_intensity: 'low',
      readiness: { feel: 'sore', pain_score: 3, notes: 'Mild tightness after Saturday' },
      physio_session: {
        session_subtype: 'rehab',
        provider: 'physiotherapist',
        clearance_status: 'modified_training',
        notes: 'Cleared for tempo work, hold off max sprinting 48h.',
        body_areas: [
          { area: 'Hamstring', side: 'left', injury_name: 'Grade 1 strain', pain_score_before: 4, pain_score_after: 2, treatment_type: 'Soft tissue + eccentrics' },
        ],
        exercises: [
          { name: 'Nordic Curl', category: 'strength', equipment: 'bodyweight', sets: [str(0, null, 6), str(1, null, 6), str(2, null, 5)] },
          { name: 'Single-leg RDL', category: 'strength', equipment: 'dumbbell', laterality: 'unilateral_left', sets: [str(0, 16, 10), str(1, 16, 10)] },
        ],
      },
      summary: { estimated_intensity: 'low', session_notes: 'Pain down from 4 to 2.', parser_confidence: 0.9 },
    },
  },
  {
    daysAgo: 5,
    title: 'Acceleration Development',
    workout_types: ['Sprint', 'Acceleration', 'Block start'],
    duration_minutes: 80,
    workout_log: 'Blocks 5x30m. Working on shin angles out of the start.',
    session: {
      parser_version: 'seed-1',
      session_type: 'sprint',
      session_subtype: 'speed',
      perceived_intensity: 'high',
      readiness: { feel: 'good', pain_score: 1 },
      sprint_session: {
        surface: 'track',
        footwear: 'spikes',
        conditions: 'Dry, still',
        efforts: [
          {
            drill_type: 'block_start',
            distance_m: 30,
            effort_percent: 95,
            footwear: 'spikes',
            rest_between_reps_seconds: 300,
            sets: 1,
            notes: 'Focus on first 3 steps',
            reps: [
              { time_seconds: 4.18 },
              { time_seconds: 4.12 },
              { time_seconds: 4.09 },
              { time_seconds: 4.07 },
              { time_seconds: 4.1, notes: 'Slight over-stride' },
            ],
          },
        ],
      },
      summary: { estimated_intensity: 'high', session_notes: 'Starts getting cleaner.', parser_confidence: 0.93 },
    },
  },
  {
    daysAgo: 7,
    title: 'Upper Body Strength',
    workout_types: ['Strength', 'Upper body'],
    duration_minutes: 60,
    workout_log: 'Bench 4x5, weighted pull-ups, OHP, DB row.',
    session: {
      parser_version: 'seed-1',
      session_type: 'strength',
      session_subtype: 'power',
      perceived_intensity: 'moderate',
      readiness: { feel: 'good', pain_score: 0 },
      blocks: [
        {
          block_name: 'Main',
          block_type: 'main',
          exercises: [
            { name: 'Bench Press', category: 'strength', equipment: 'barbell', sets: [str(0, 40, 5, { is_warmup: true }), str(1, 70, 5), str(2, 80, 5), str(3, 85, 5), str(4, 85, 4)] },
            { name: 'Weighted Pull-up', category: 'strength', equipment: 'bodyweight', sets: [str(0, 10, 6), str(1, 10, 6), str(2, 10, 5)] },
            { name: 'Overhead Press', category: 'strength', equipment: 'barbell', sets: [str(0, 45, 6), str(1, 50, 5), str(2, 50, 5)] },
            { name: 'Dumbbell Row', category: 'strength', equipment: 'dumbbell', sets: [str(0, 32, 10), str(1, 32, 10)] },
          ],
        },
      ],
      summary: { estimated_intensity: 'moderate', session_notes: 'Solid pressing day.', parser_confidence: 0.95 },
    },
  },
  {
    daysAgo: 9,
    title: '100m — City Championships',
    workout_types: ['Competition', 'Race'],
    duration_minutes: 120,
    workout_log: 'City Champs 100m. Heat 10.61 (+0.8), Final 10.52 (+1.2) — new PB! 3rd place.',
    session: {
      parser_version: 'seed-1',
      session_type: 'competition',
      perceived_intensity: 'max',
      readiness: { feel: 'great', pain_score: 0, notes: 'Race day nerves, good warmup' },
      competition_result: {
        event: '100m',
        competition_name: 'City Championships',
        venue: 'Olympic Stadium',
        lane: 4,
        status: 'completed',
        conditions: 'Sunny, light tailwind',
        best_time_seconds: 10.52,
        notes: 'New personal best in the final.',
        rounds: [
          { round_type: 'heat', time_seconds: 10.61, wind_ms: 0.8, ranking: 2, sb: true },
          { round_type: 'final', time_seconds: 10.52, wind_ms: 1.2, ranking: 3, pb: true },
        ],
      },
      summary: { estimated_intensity: 'max', session_notes: 'PB 10.52! Great close to the first block.', parser_confidence: 0.98 },
    },
  },
  {
    daysAgo: 11,
    title: 'Speed Endurance — 150s',
    workout_types: ['Sprint', 'Speed endurance'],
    duration_minutes: 85,
    workout_log: '3x150m @ 95%, 10 min recovery. Hold form through 120m.',
    session: {
      parser_version: 'seed-1',
      session_type: 'sprint',
      session_subtype: 'speed_endurance',
      perceived_intensity: 'high',
      readiness: { feel: 'tired', pain_score: 1 },
      sprint_session: {
        surface: 'track',
        footwear: 'spikes',
        conditions: 'Overcast',
        efforts: [
          {
            drill_type: 'speed_endurance',
            distance_m: 150,
            effort_percent: 95,
            rest_between_reps_seconds: 600,
            sets: 1,
            reps: [{ time_seconds: 16.4 }, { time_seconds: 16.6 }, { time_seconds: 16.9, notes: 'Tied up last 20m' }],
          },
        ],
      },
      summary: { estimated_intensity: 'high', session_notes: 'Fatigue showing by rep 3.', parser_confidence: 0.92 },
    },
  },
  {
    daysAgo: 14,
    title: 'Olympic Lifting',
    workout_types: ['Strength', 'Power'],
    duration_minutes: 65,
    workout_log: 'Power clean 5x2, snatch pulls, jump squats.',
    session: {
      parser_version: 'seed-1',
      session_type: 'strength',
      session_subtype: 'power',
      perceived_intensity: 'high',
      readiness: { feel: 'good', pain_score: 0 },
      blocks: [
        {
          block_name: 'Main',
          block_type: 'main',
          exercises: [
            { name: 'Power Clean', category: 'olympic_lift', equipment: 'barbell', sets: [str(0, 60, 3, { is_warmup: true }), str(1, 80, 2), str(2, 85, 2), str(3, 90, 2), str(4, 90, 2)] },
            { name: 'Snatch-grip Pull', category: 'olympic_lift', equipment: 'barbell', sets: [str(0, 90, 3), str(1, 100, 3), str(2, 100, 3)] },
            { name: 'Jump Squat', category: 'plyometric', equipment: 'barbell', sets: [str(0, 40, 4), str(1, 40, 4), str(2, 40, 4)] },
          ],
        },
      ],
      summary: { estimated_intensity: 'high', session_notes: 'Cleans crisp at 90.', parser_confidence: 0.95 },
    },
  },
  {
    daysAgo: 16,
    title: 'Tempo Runs',
    workout_types: ['Conditioning', 'Tempo'],
    duration_minutes: 55,
    workout_log: '2x6x100m tempo @ 70%, walk 100m between, 3 min between sets.',
    session: {
      parser_version: 'seed-1',
      session_type: 'conditioning',
      session_subtype: 'tempo',
      perceived_intensity: 'moderate',
      readiness: { feel: 'good', pain_score: 0 },
      sprint_session: {
        surface: 'grass',
        footwear: 'trainers',
        conditions: 'Cool',
        efforts: [
          {
            drill_type: 'tempo',
            distance_m: 100,
            effort_percent: 70,
            rest_between_reps_seconds: 60,
            sets: 2,
            notes: '12 total reps',
            reps: Array.from({ length: 12 }, (_, i) => ({ time_seconds: 15 + (i % 3) * 0.3 })),
          },
        ],
      },
      summary: { estimated_intensity: 'moderate', session_notes: 'Easy aerobic tempo, felt controlled.', parser_confidence: 0.9 },
    },
  },
  {
    daysAgo: 18,
    title: 'Block Starts',
    workout_types: ['Sprint', 'Block start'],
    duration_minutes: 75,
    workout_log: 'Starts to 20m, 6 reps, on the gun. Reaction work.',
    session: {
      parser_version: 'seed-1',
      session_type: 'sprint',
      session_subtype: 'speed',
      perceived_intensity: 'high',
      readiness: { feel: 'good', pain_score: 0 },
      sprint_session: {
        surface: 'track',
        footwear: 'spikes',
        conditions: 'Indoor',
        efforts: [
          {
            drill_type: 'block_start',
            distance_m: 20,
            effort_percent: 95,
            rest_between_reps_seconds: 240,
            sets: 1,
            reps: [{ time_seconds: 3.01 }, { time_seconds: 2.98 }, { time_seconds: 2.95 }, { time_seconds: 2.96 }, { time_seconds: 2.94 }, { time_seconds: 2.97 }],
          },
        ],
      },
      summary: { estimated_intensity: 'high', session_notes: 'Reaction sharp indoors.', parser_confidence: 0.93 },
    },
  },
  {
    daysAgo: 21,
    title: '200m — Regional Open',
    workout_types: ['Competition', 'Race'],
    duration_minutes: 110,
    workout_log: 'Regional Open 200m. Heat 21.8, Final 21.55 (SB). 2nd.',
    session: {
      parser_version: 'seed-1',
      session_type: 'competition',
      perceived_intensity: 'max',
      readiness: { feel: 'good', pain_score: 1 },
      competition_result: {
        event: '200m',
        competition_name: 'Regional Open',
        venue: 'Riverside Track',
        lane: 5,
        status: 'completed',
        conditions: 'Breezy',
        best_time_seconds: 21.55,
        notes: 'Season best, good bend running.',
        rounds: [
          { round_type: 'heat', time_seconds: 21.8, wind_ms: -0.5, ranking: 1 },
          { round_type: 'final', time_seconds: 21.55, wind_ms: 0.6, ranking: 2, sb: true },
        ],
      },
      summary: { estimated_intensity: 'max', session_notes: 'SB 21.55. Bend felt strong.', parser_confidence: 0.97 },
    },
  },
  {
    daysAgo: 24,
    title: 'Lower Body Strength',
    workout_types: ['Strength', 'Leg'],
    duration_minutes: 70,
    workout_log: 'Front squat, Bulgarian split squat, calf raises.',
    session: {
      parser_version: 'seed-1',
      session_type: 'strength',
      session_subtype: 'power',
      perceived_intensity: 'moderate',
      readiness: { feel: 'good', pain_score: 0 },
      blocks: [
        {
          block_name: 'Main',
          block_type: 'main',
          exercises: [
            { name: 'Front Squat', category: 'strength', equipment: 'barbell', sets: [str(0, 50, 5, { is_warmup: true }), str(1, 80, 4), str(2, 90, 3), str(3, 95, 3)] },
            { name: 'Bulgarian Split Squat', category: 'strength', equipment: 'dumbbell', laterality: 'unilateral_left', sets: [str(0, 24, 8), str(1, 24, 8)] },
            { name: 'Standing Calf Raise', category: 'strength', equipment: 'machine', sets: [str(0, 80, 12), str(1, 80, 12), str(2, 80, 12)] },
          ],
        },
      ],
      summary: { estimated_intensity: 'moderate', session_notes: 'Front squat depth good.', parser_confidence: 0.94 },
    },
  },
  {
    daysAgo: 28,
    title: 'Plyometric & Core',
    workout_types: ['Plyometric', 'Core'],
    duration_minutes: 50,
    workout_log: 'Bounding, hurdle hops, box jumps, hanging leg raises.',
    session: {
      parser_version: 'seed-1',
      session_type: 'conditioning',
      session_subtype: 'power',
      perceived_intensity: 'moderate',
      readiness: { feel: 'good', pain_score: 0 },
      blocks: [
        {
          block_name: 'Plyometrics',
          block_type: 'main',
          exercises: [
            { name: 'Bounding', category: 'plyometric', equipment: 'bodyweight', sets: [str(0, null, 10), str(1, null, 10), str(2, null, 10)] },
            { name: 'Hurdle Hops', category: 'plyometric', equipment: 'bodyweight', sets: [str(0, null, 8), str(1, null, 8)] },
            { name: 'Box Jump', category: 'jump', equipment: 'bodyweight', sets: [str(0, null, 5), str(1, null, 5), str(2, null, 5)] },
          ],
        },
        {
          block_name: 'Core',
          block_type: 'circuit',
          exercises: [
            { name: 'Hanging Leg Raise', category: 'core', equipment: 'bodyweight', sets: [str(0, null, 12), str(1, null, 12)] },
            { name: 'Plank', category: 'core', equipment: 'bodyweight', sets: [str(0, null, 1, { duration_seconds: 60 }), str(1, null, 1, { duration_seconds: 60 })] },
          ],
        },
      ],
      summary: { estimated_intensity: 'moderate', session_notes: 'Explosive, good contact times.', parser_confidence: 0.9 },
    },
  },
  {
    daysAgo: 35,
    title: 'Acceleration — Sled',
    workout_types: ['Sprint', 'Acceleration'],
    duration_minutes: 70,
    workout_log: 'Sled pushes + resisted 20s, then free 30s.',
    session: {
      parser_version: 'seed-1',
      session_type: 'sprint',
      session_subtype: 'speed',
      perceived_intensity: 'high',
      readiness: { feel: 'good', pain_score: 0 },
      sprint_session: {
        surface: 'track',
        footwear: 'spikes',
        conditions: 'Dry',
        efforts: [
          { drill_type: 'acceleration', distance_m: 20, effort_percent: 90, rest_between_reps_seconds: 180, sets: 1, notes: 'Resisted (sled)', reps: [{ time_seconds: 3.4 }, { time_seconds: 3.36 }, { time_seconds: 3.34 }] },
          { drill_type: 'acceleration', distance_m: 30, effort_percent: 95, rest_between_reps_seconds: 240, sets: 1, notes: 'Free', reps: [{ time_seconds: 4.15 }, { time_seconds: 4.11 }] },
        ],
      },
      summary: { estimated_intensity: 'high', session_notes: 'Good contrast sled→free.', parser_confidence: 0.92 },
    },
  },
  {
    daysAgo: 42,
    title: 'Full Body Strength',
    workout_types: ['Strength', 'Gym'],
    duration_minutes: 75,
    workout_log: 'Deadlift, incline bench, chin-ups, core.',
    session: {
      parser_version: 'seed-1',
      session_type: 'strength',
      session_subtype: 'power',
      perceived_intensity: 'high',
      readiness: { feel: 'good', pain_score: 0 },
      blocks: [
        {
          block_name: 'Main',
          block_type: 'main',
          exercises: [
            { name: 'Deadlift', category: 'strength', equipment: 'barbell', sets: [str(0, 80, 5, { is_warmup: true }), str(1, 120, 3), str(2, 140, 3), str(3, 150, 2)] },
            { name: 'Incline Bench Press', category: 'strength', equipment: 'barbell', sets: [str(0, 60, 6), str(1, 70, 5), str(2, 70, 5)] },
            { name: 'Chin-up', category: 'strength', equipment: 'bodyweight', sets: [str(0, null, 10), str(1, null, 8), str(2, null, 8)] },
          ],
        },
      ],
      summary: { estimated_intensity: 'high', session_notes: 'Deadlift 150 for a double.', parser_confidence: 0.95 },
    },
  },
  {
    daysAgo: 49,
    title: 'Fly Sprints',
    workout_types: ['Sprint', 'Max Velocity'],
    duration_minutes: 65,
    workout_log: '4x20m flys, full recovery.',
    session: {
      parser_version: 'seed-1',
      session_type: 'sprint',
      session_subtype: 'speed',
      perceived_intensity: 'max',
      readiness: { feel: 'great', pain_score: 0 },
      sprint_session: {
        surface: 'track',
        footwear: 'spikes',
        conditions: 'Dry, +0.6 m/s',
        efforts: [
          { drill_type: 'fly', distance_m: 20, effort_percent: 100, rest_between_reps_seconds: 360, sets: 1, reps: [{ time_seconds: 1.98 }, { time_seconds: 1.95 }, { time_seconds: 1.93 }, { time_seconds: 1.94 }] },
        ],
      },
      summary: { estimated_intensity: 'max', session_notes: 'Early-season top speed check.', parser_confidence: 0.93 },
    },
  },
]

// ── MEALS (last 7 days, a few per day) ─────────────────────────────────────────
type MealSpec = { daysAgo: number; hour: number; title: string; type: string; kcal: number; p: number; c: number; f: number; notes?: string }
const MEALS: MealSpec[] = [
  { daysAgo: 0, hour: 8, title: 'Oats, banana & peanut butter', type: 'BREAKFAST', kcal: 520, p: 18, c: 78, f: 16 },
  { daysAgo: 0, hour: 13, title: 'Chicken, rice & broccoli', type: 'LUNCH', kcal: 680, p: 52, c: 70, f: 16, notes: 'Pre-session fuel' },
  { daysAgo: 0, hour: 16, title: 'Greek yogurt & berries', type: 'SNACK', kcal: 240, p: 20, c: 28, f: 5 },
  { daysAgo: 0, hour: 20, title: 'Salmon, sweet potato & greens', type: 'DINNER', kcal: 720, p: 45, c: 60, f: 30 },
  { daysAgo: 1, hour: 8, title: 'Scrambled eggs on sourdough', type: 'BREAKFAST', kcal: 480, p: 28, c: 38, f: 24 },
  { daysAgo: 1, hour: 13, title: 'Beef & quinoa bowl', type: 'LUNCH', kcal: 710, p: 48, c: 62, f: 26 },
  { daysAgo: 1, hour: 19, title: 'Pasta with turkey bolognese', type: 'DINNER', kcal: 760, p: 44, c: 92, f: 20 },
  { daysAgo: 2, hour: 9, title: 'Protein smoothie', type: 'BREAKFAST', kcal: 410, p: 35, c: 48, f: 8, notes: 'Whey, oats, banana, milk' },
  { daysAgo: 2, hour: 13, title: 'Tuna wrap', type: 'LUNCH', kcal: 560, p: 38, c: 52, f: 20 },
  { daysAgo: 2, hour: 20, title: 'Stir-fry chicken & noodles', type: 'DINNER', kcal: 690, p: 46, c: 74, f: 18 },
  { daysAgo: 3, hour: 8, title: 'Overnight oats', type: 'BREAKFAST', kcal: 450, p: 22, c: 68, f: 12 },
  { daysAgo: 3, hour: 15, title: 'Rice cakes & almond butter', type: 'SNACK', kcal: 260, p: 8, c: 30, f: 13 },
  { daysAgo: 3, hour: 19, title: 'Grilled chicken salad', type: 'DINNER', kcal: 540, p: 50, c: 24, f: 26 },
  { daysAgo: 4, hour: 9, title: 'Bagel with eggs & avocado', type: 'BRUNCH', kcal: 610, p: 30, c: 58, f: 30 },
  { daysAgo: 4, hour: 14, title: 'Chicken burrito', type: 'LUNCH', kcal: 780, p: 46, c: 88, f: 26 },
  { daysAgo: 4, hour: 20, title: 'Cod, potatoes & peas', type: 'DINNER', kcal: 620, p: 48, c: 66, f: 14 },
  { daysAgo: 5, hour: 8, title: 'Porridge & honey', type: 'BREAKFAST', kcal: 430, p: 16, c: 76, f: 9 },
  { daysAgo: 5, hour: 18, title: 'Steak, rice & spinach', type: 'DINNER', kcal: 740, p: 52, c: 58, f: 32 },
  { daysAgo: 6, hour: 10, title: 'Flat white', type: 'DRINK', kcal: 120, p: 7, c: 10, f: 6 },
  { daysAgo: 6, hour: 13, title: 'Egg fried rice & prawns', type: 'LUNCH', kcal: 650, p: 34, c: 80, f: 18 },
  { daysAgo: 6, hour: 20, title: 'Chicken curry & naan', type: 'DINNER', kcal: 820, p: 44, c: 90, f: 30 },
]

async function clearExisting() {
  const tables = [
    'exercise_sets', 'session_exercises', 'session_blocks', 'session_details',
    'sprint_reps', 'sprint_efforts', 'competition_rounds', 'competition_results',
    'physio_body_areas', 'training_logs', 'meal_records',
  ]
  for (const t of tables) {
    const { error } = await db.from(t).delete().eq('user_id', USER)
    if (error) throw new Error(`clear ${t}: ${error.message}`)
  }
}

async function run() {
  console.log(`▶  seeding demo data for chevycheung (${USER}) on dev\n`)

  console.log('— clearing existing rows —')
  await clearExisting()

  console.log('— inserting workouts —')
  for (const w of WORKOUTS) {
    await persistWorkout(w)
    console.log(`  ✓ ${w.title}  (${dateAgo(w.daysAgo)})`)
  }

  console.log('— inserting meals —')
  const mealRows = MEALS.map((m) => ({
    meal_id: randomUUID(),
    user_id: USER,
    title: m.title,
    meal_type: m.type,
    calories: m.kcal,
    protein: m.p,
    carbs: m.c,
    fat: m.f,
    user_notes: m.notes ?? null,
    s3_link: null,
    created_at: tsAgo(m.daysAgo, m.hour, 0),
    updated_at: tsAgo(m.daysAgo, m.hour, 0),
  }))
  const { error: mealErr } = await db.from('meal_records').insert(mealRows)
  if (mealErr) throw new Error(`meal_records: ${mealErr.message}`)
  console.log(`  ✓ ${mealRows.length} meals`)

  // verify
  console.log('\n— verifying —')
  for (const t of ['training_logs', 'session_details', 'exercise_sets', 'sprint_reps', 'competition_rounds', 'physio_body_areas', 'meal_records']) {
    const { count } = await db.from(t).select('*', { count: 'exact', head: true }).eq('user_id', USER)
    console.log(`  ${t}: ${count}`)
  }
  console.log('\n✅  done.')
}

run().catch((e) => {
  console.error(`❌  ${e?.message ?? e}`)
  process.exit(1)
})
