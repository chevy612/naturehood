/**
 * AI Workout Parser — v2 Integration Test Suite
 * Tests the AthleteSessionLog parser across all 10 session types.
 *
 * Usage (from my-app/):
 *   npm run test:ai
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

// ─── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=][^=]*)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '')
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌  ANTHROPIC_API_KEY not found in .env.local')
  process.exit(1)
}

// ─── Types (mirrors lib/types.ts — kept inline so script is self-contained) ──

type SessionType =
  | 'strength' | 'sprint' | 'conditioning' | 'competition'
  | 'physio' | 'rehab' | 'prehab' | 'recovery' | 'mixed' | 'unknown'

type PerceivedIntensity = 'low' | 'moderate' | 'high' | 'max'

interface AthleteSetLog {
  set_index: number
  is_warmup?: boolean
  is_failure?: boolean
  weight_kg?: number | null
  weight_type?: string | null
  machine_level?: number | null
  added_weight_kg?: number | null
  reps?: number | null
  duration_seconds?: number | null
  distance_m?: number | null
  effort_percent?: number | null
  rest_seconds?: number | null
  notes?: string | null
}

interface AthleteExerciseLog {
  exercise_index: number
  name: string
  name_original?: string | null
  name_unknown?: boolean
  category?: string
  equipment?: string | null
  sets: AthleteSetLog[]
  total_volume_kg?: number | null
  max_weight_kg?: number | null
  total_reps?: number | null
  set_count?: number
  notes?: string | null
}

interface AthleteBlock {
  block_index: number
  block_name?: string | null
  block_type?: string | null
  emom_interval_seconds?: number | null
  circuit_rounds?: number | null
  exercises: AthleteExerciseLog[]
}

interface CompetitionRound {
  round_type: 'heat' | 'semifinal' | 'final' | 'relay'
  time_seconds?: number | null
  pb?: boolean
  sb?: boolean
  relay_leg?: number | null
  notes?: string | null
}

interface CompetitionResult {
  event?: string | null
  competition_name?: string | null
  status: 'completed' | 'dns' | 'dnf' | 'dq'
  rounds: CompetitionRound[]
  best_time_seconds?: number | null
  notes?: string | null
}

interface SprintRep {
  rep_index: number
  time_seconds?: number | null
  split_times_seconds?: number[]
  completed?: boolean
}

interface SprintEffort {
  effort_index: number
  drill_type: string
  distance_m?: number | null
  effort_percent?: number | null
  reps: SprintRep[]
}

interface SprintSession {
  surface?: string | null
  footwear?: string | null
  efforts: SprintEffort[]
}

interface PhysioBodyArea {
  area: string
  side?: string | null
  injury_name?: string | null
  pain_score_before?: number | null
  pain_score_after?: number | null
  treatment_type?: string | null
}

interface PhysioSession {
  session_subtype?: string | null
  provider?: string | null
  body_areas?: PhysioBodyArea[]
  exercises?: AthleteExerciseLog[]
  clearance_status?: string | null
  notes?: string | null
}

interface SessionSummary {
  total_volume_kg?: number | null
  total_sets?: number | null
  total_reps?: number | null
  total_distance_m?: number | null
  estimated_intensity?: PerceivedIntensity | null
  session_notes?: string | null
  parser_confidence?: number
  parsing_warnings?: string[]
}

interface AthleteSessionLog {
  parser_version: string
  title?: string | null
  duration_minutes?: number | null
  session_type: SessionType
  session_subtype?: string | null
  perceived_intensity?: PerceivedIntensity | null
  readiness?: { feel?: string | null; pain_score?: number | null } | null
  blocks?: AthleteBlock[]
  competition_result?: CompetitionResult | null
  physio_session?: PhysioSession | null
  sprint_session?: SprintSession | null
  summary: SessionSummary
}

// ─── System prompt (copied from lib/services/ai-workout.ts) ──────────────────

const SYSTEM_PROMPT = `You are an elite athletics log parser. You receive a JSON envelope describing one athlete session and must return a single valid AthleteSessionLog JSON object — no prose, no markdown, no code fences.

═══════════════════════════════════════════════
INPUT ENVELOPE (always JSON)
═══════════════════════════════════════════════
{
  "title": string,
  "workout_types": string[],   // tags chosen by athlete e.g. ["strength","powerlifting"]
  "duration_minutes": number | null,
  "notes": string | null,      // athlete's freetext notes (separate from workout_log)
  "workout_log": string        // raw exercise log text
}

═══════════════════════════════════════════════
STEP 1 — DETERMINE session_type
═══════════════════════════════════════════════
Use this priority order. Match the FIRST rule that fires.

1. "competition"
   • workout_types includes "competition"
   • OR title/notes contain: race, meet, heat, final, relay, championship, pb, sb, time trial
   → populate competition_result

2. "physio" | "rehab" | "prehab"
   • workout_types includes "physio", "rehab", or "prehab"
   • OR title/notes mention: physio, physiotherapist, rehab, prehab, massage, ice bath, treatment, injury, dry needling, taping
   → use the most specific matching type; populate physio_session

3. "sprint"
   • workout_types includes "sprint", "speed", "track"
   • OR title/notes mention: sprint, fly, block start, acceleration, tempo run, hill sprint, speed work, hurdle, relay
   → populate sprint_session

4. "recovery"
   • workout_types includes "recovery", "rest", "active recovery"
   • OR title/notes mention: recovery, easy walk, light jog, foam roll, stretch, rest day
   → populate blocks[] (may be empty or minimal)

5. "conditioning"
   • workout_types includes "conditioning", "cardio", "circuit", "crossfit"
   → populate blocks[]

6. "strength"
   • workout_types includes "strength", "powerlifting", "weightlifting", "gym", "lifting"
   • OR workout_log contains weighted exercises (kg/lbs notation, set×rep notation)
   → populate blocks[]

7. "mixed"
   • Multiple conflicting signals (e.g. strength + sprint + competition in same session)
   → populate ALL applicable sub-schemas

8. "unknown"
   • None of the above match or workout_log is empty/unrecognisable
   → return minimal object with session_type "unknown" and empty summary

═══════════════════════════════════════════════
STEP 2 — PARSE workout_log INTO THE CORRECT SUB-SCHEMA
═══════════════════════════════════════════════

── STRENGTH / CONDITIONING / RECOVERY → blocks[] ──

Block detection:
• Named headers (e.g. "Warm-up:", "Main set", "Strength") → separate blocks with block_name
• Albert-style: one row per exercise with no headers → single block, block_name = null
• block_type: "warmup" if name contains warm/activation; "cooldown" if cool/stretch; "main" otherwise

Exercise parsing:
• "Name  sets×reps  weight" format → one AthleteExerciseLog per exercise
• "(4x95 4x95 4x95)" parenthesised block → one exercise per position-column; name_unknown = true if no name
• Name original language (Danish etc.) → name = translated English, name_original = original
• Descending reps "11xlvl15 10xlvl15" → sets=3, reps null per set (store individual reps in set notes if needed)

Set parsing:
• "4x80" → 4 sets of 80 reps? No — read as reps=4, weight_kg=80 only if context is weight exercise
  Actually: "4x80" in context of e.g. "Power clean" → reps=4, weight_kg=80
  "4x80 4x90" = two separate sets: {reps:4, weight_kg:80}, {reps:4, weight_kg:90}
• "(0)" or "not able to finish" → is_failure = true
• Warmup sets: first lighter sets before main working weight → is_warmup = true
• "50/60/70/80/90" slash-separated weights → one set per weight value
• "+10kg" → weight_type: "added", added_weight_kg: 10, weight_kg = bodyweight + 10 (omit weight_kg if BW unknown)
• "xlvl15" → weight_type: "machine_level", machine_level: 15, weight_kg = null
• "xg" / "BW" → weight_type: "bodyweight", weight_kg = null
• "30s max rep" → duration_seconds: 30, reps: null (is "max" effort)
• Rest lines / "r: 90s" → rest_seconds: 90 on the preceding set; do NOT create a new exercise

Computed fields (fill after parsing all sets):
• total_volume_kg = sum(weight_kg × reps) for all non-warmup sets where both exist
• max_weight_kg = max weight_kg across all sets
• total_reps = sum of reps across all sets
• set_count = number of sets

── SPRINT → sprint_session ──

• "3×30m fly @ 90%" → SprintEffort { drill_type:"fly", distance_m:30, effort_percent:90, reps:[...] }
• "10m splits: 1.12 1.11 1.11" → rep.split_times_seconds = [1.12, 1.11, 1.11]
• Footwear: "flats" / "spikes" / "trainers" — session-level; per-effort override if mixed
• drill_type mapping:
  fly → "fly"
  block start / blocks → "block_start"
  acceleration / acc run → "acceleration"
  tempo run / tempo → "tempo"
  hill sprint → "hill_sprint"
  speed endurance → "speed_endurance"
  hurdle / hurdles → "hurdle"
  relay exchange → "relay_exchange"
  time trial → "time_trial"

── COMPETITION → competition_result ──

• event: e.g. "400m", "4×400m relay", "100m hurdles"
• rounds: one CompetitionRound per heat/semi/final mentioned
• round_type: "heat" | "semifinal" | "final" | "relay"
• time_seconds: convert "52.02" → 52.02, "1:02.5" → 62.5
• pb / sb: true if text says "PB", "personal best", "SB", "season best"
• status: "dns" if "DNS"/"did not start"/"scratch"; "dnf" if "DNF"; "dq" if "DQ"; else "completed"
• best_time_seconds: fastest completed round time

── PHYSIO / REHAB / PREHAB → physio_session ──

• body_areas: array of affected areas with side (left/right/bilateral) and injury_name if mentioned
• exercises: same AthleteExerciseLog structure as strength blocks
• clearance_status: "cleared" / "modified_training" / "rest_only" / "pending_review" / null
• treatment_type: "manual therapy" | "dry needling" | "exercise" | "taping" | null

═══════════════════════════════════════════════
STEP 3 — FILL summary (always required)
═══════════════════════════════════════════════
• total_volume_kg, total_sets, total_reps, total_distance_m — aggregate across all blocks/efforts
• estimated_intensity: infer from % values, RPE mentions, "easy/moderate/hard/max" text, or intensity keywords
  ("65%" → "low", "80%" → "moderate", "90-95%" → "high", "max/100%" → "max")
• session_notes: one concise sentence describing the session
• parser_confidence: 0.0–1.0
  0.9–1.0: all fields clearly stated
  0.7–0.89: minor ambiguity (e.g. some weights inferred)
  0.5–0.69: significant ambiguity (e.g. position-indexed exercises, unclear notation)
  < 0.5: mostly guessed
• parsing_warnings: list any: position-inferred names, unconvertible units, missing fields, ambiguous notation

═══════════════════════════════════════════════
UNIT CONVERSIONS
═══════════════════════════════════════════════
• lbs → kg: divide by 2.205, round to 1 decimal
• miles → km: multiply by 1.609, round to 2 decimals
• km → m: multiply by 1000 (store as distance_m)
• European decimal comma "167,5" → 167.5 (already pre-processed but handle if present)
• "1:02.5" time format → 62.5 seconds

═══════════════════════════════════════════════
OUTPUT SCHEMA (return exactly this shape)
═══════════════════════════════════════════════
{
  "parser_version": "2.0.0",
  "title": string | null,
  "duration_minutes": number | null,
  "session_type": SessionType,
  "session_subtype": string | null,
  "language_detected": "en" | "da" | "zh" | ...,
  "perceived_intensity": "low"|"moderate"|"high"|"max" | null,
  "readiness": { "feel": string|null, "pain_score": number|null, "notes": string|null } | null,
  "blocks": [...] | null,
  "competition_result": {...} | null,
  "physio_session": {...} | null,
  "sprint_session": {...} | null,
  "summary": {
    "total_volume_kg": number|null,
    "total_sets": number|null,
    "total_reps": number|null,
    "total_distance_m": number|null,
    "total_work_duration_seconds": number|null,
    "estimated_intensity": string|null,
    "session_notes": string,
    "parser_confidence": number,
    "parsing_warnings": string[]
  },
  "coach_review": null
}

Omit sub-schemas that don't apply (set to null).
If workout_log is empty or unrecognisable, return session_type "unknown" and empty summary.
Return ONLY the JSON object. No explanation, no markdown.`

// ─── Parser ───────────────────────────────────────────────────────────────────

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface ParseParams {
  workout_log: string
  title?: string
  workout_types?: string[]
  duration_minutes?: number | null
  notes?: string | null
}

async function parse(params: ParseParams): Promise<AthleteSessionLog | null> {
  const normalisedLog = params.workout_log.trim().replace(/(\d),(\d)/g, '$1.$2')
  const envelope = JSON.stringify({
    title: params.title ?? null,
    workout_types: params.workout_types ?? [],
    duration_minutes: params.duration_minutes ?? null,
    notes: params.notes ?? null,
    workout_log: normalisedLog,
  })

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: envelope }],
    })
    const block = msg.content[0]
    if (block.type !== 'text') return null
    const jsonText = block.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    const parsed = JSON.parse(jsonText) as AthleteSessionLog
    if (!parsed.session_type || !parsed.summary) return null
    return parsed
  } catch (err) {
    console.error('  parse error:', err)
    return null
  }
}

// ─── Test Cases ───────────────────────────────────────────────────────────────

interface TestCase {
  name: string
  params: ParseParams
  /** Key sub-schema to print on pass/fail — for quick eyeballing */
  inspect: (r: AthleteSessionLog) => unknown
  check: (r: AthleteSessionLog) => { pass: boolean; reason?: string }
}

const TESTS: TestCase[] = [
  // ── 1. Strength ─────────────────────────────────────────────────────────────
  {
    name: '1. Strength — named blocks with Olympic lifts',
    params: {
      title: 'Strength — Tuesday',
      workout_types: ['strength'],
      duration_minutes: 90,
      workout_log: `Warm-up:
Snatch 3x50 3x60
Power clean 4x80 4x90 4x100

Main:
Back squat 4x8@120 4x8@130
Romanian deadlift 3x10@90

Accessory:
Hip flexor raises 3x12xg
Plank 3x60s`,
    },
    inspect: (r) => ({ session_type: r.session_type, blocks: r.blocks?.map(b => ({ name: b.block_name, exCount: b.exercises.length })) }),
    check: (r) => {
      if (r.session_type !== 'strength') return { pass: false, reason: `session_type: expected "strength", got "${r.session_type}"` }
      if (!r.blocks || r.blocks.length < 2) return { pass: false, reason: `blocks: expected ≥2, got ${r.blocks?.length ?? 0}` }
      const allExercises = r.blocks.flatMap(b => b.exercises)
      if (allExercises.length < 3) return { pass: false, reason: `total exercises: expected ≥3, got ${allExercises.length}` }
      const namedBlock = r.blocks.find(b => b.block_name)
      if (!namedBlock) return { pass: false, reason: 'no named block found (expected "Warm-up" or "Main")' }
      const hasVolume = r.summary.total_volume_kg != null && r.summary.total_volume_kg > 0
      if (!hasVolume) return { pass: false, reason: 'total_volume_kg missing or zero' }
      return { pass: true }
    },
  },

  // ── 2. Sprint ───────────────────────────────────────────────────────────────
  {
    name: '2. Sprint — fly efforts with 10m splits',
    params: {
      title: 'Speed session',
      workout_types: ['sprint', 'track'],
      workout_log: `3×30m fly @ 90% flats
splits: 1.12 1.11 1.10
r: 4min

2×60m acc run @ 95% spikes`,
    },
    inspect: (r) => ({ session_type: r.session_type, efforts: r.sprint_session?.efforts.map(e => ({ drill: e.drill_type, dist: e.distance_m, reps: e.reps.length })) }),
    check: (r) => {
      if (r.session_type !== 'sprint') return { pass: false, reason: `session_type: expected "sprint", got "${r.session_type}"` }
      if (!r.sprint_session) return { pass: false, reason: 'sprint_session is null' }
      if (r.sprint_session.efforts.length < 2) return { pass: false, reason: `efforts: expected ≥2, got ${r.sprint_session.efforts.length}` }
      const fly = r.sprint_session.efforts.find(e => e.drill_type === 'fly')
      if (!fly) return { pass: false, reason: 'no effort with drill_type "fly"' }
      if (fly.distance_m !== 30) return { pass: false, reason: `fly distance_m: expected 30, got ${fly.distance_m}` }
      const firstRep = fly.reps[0]
      if (!firstRep?.split_times_seconds || firstRep.split_times_seconds.length < 3) {
        return { pass: false, reason: `fly rep splits: expected ≥3 values, got ${firstRep?.split_times_seconds?.length ?? 0}` }
      }
      return { pass: true }
    },
  },

  // ── 3. Competition ──────────────────────────────────────────────────────────
  {
    name: '3. Competition — 400m race with heat + final',
    params: {
      title: 'USFHK Meet',
      workout_types: ['competition'],
      workout_log: `400m
Heat: 52.02
Final: 51.08 (season best)
Thanks to HKAAA`,
    },
    inspect: (r) => ({ session_type: r.session_type, result: r.competition_result }),
    check: (r) => {
      if (r.session_type !== 'competition') return { pass: false, reason: `session_type: expected "competition", got "${r.session_type}"` }
      const cr = r.competition_result
      if (!cr) return { pass: false, reason: 'competition_result is null' }
      if (cr.rounds.length < 2) return { pass: false, reason: `rounds: expected 2, got ${cr.rounds.length}` }
      if (cr.best_time_seconds !== 51.08) return { pass: false, reason: `best_time_seconds: expected 51.08, got ${cr.best_time_seconds}` }
      const finalRound = cr.rounds.find(r => r.round_type === 'final')
      if (!finalRound) return { pass: false, reason: 'no round with round_type "final"' }
      const hasSb = cr.rounds.some(r => r.sb === true)
      if (!hasSb) return { pass: false, reason: 'no round marked sb: true (season best)' }
      if (cr.status !== 'completed') return { pass: false, reason: `status: expected "completed", got "${cr.status}"` }
      return { pass: true }
    },
  },

  // ── 4. Physio ───────────────────────────────────────────────────────────────
  {
    name: '4. Physio — hamstring treatment session',
    params: {
      title: 'Physio session',
      workout_types: ['physio'],
      workout_log: `Left hamstring — grade 1 strain
Manual therapy + dry needling
Pain before: 5/10, pain after: 2/10
Modified training — no sprinting`,
    },
    inspect: (r) => ({ session_type: r.session_type, physio: r.physio_session }),
    check: (r) => {
      if (r.session_type !== 'physio') return { pass: false, reason: `session_type: expected "physio", got "${r.session_type}"` }
      const ps = r.physio_session
      if (!ps) return { pass: false, reason: 'physio_session is null' }
      if (!ps.body_areas || ps.body_areas.length < 1) return { pass: false, reason: 'physio_session.body_areas is empty' }
      const hamstring = ps.body_areas.find(a => a.area.toLowerCase().includes('hamstring'))
      if (!hamstring) return { pass: false, reason: 'no body_area with area "hamstring"' }
      if (hamstring.side !== 'left') return { pass: false, reason: `hamstring side: expected "left", got "${hamstring.side}"` }
      if (!ps.clearance_status) return { pass: false, reason: 'clearance_status is null' }
      return { pass: true }
    },
  },

  // ── 5. Rehab ────────────────────────────────────────────────────────────────
  {
    name: '5. Rehab — ACL recovery exercises',
    params: {
      title: 'ACL Rehab — Week 6',
      workout_types: ['rehab'],
      workout_log: `Terminal knee extensions 3x15 band
Single leg press 3x12 @ lvl8
Side-lying clamshells 3x20xg each side
Balance board 3x30s`,
    },
    inspect: (r) => ({ session_type: r.session_type, exercises: r.physio_session?.exercises?.map(e => e.name) }),
    check: (r) => {
      if (r.session_type !== 'rehab') return { pass: false, reason: `session_type: expected "rehab", got "${r.session_type}"` }
      const ps = r.physio_session
      if (!ps) return { pass: false, reason: 'physio_session is null' }
      const exercises = ps.exercises ?? []
      if (exercises.length < 3) return { pass: false, reason: `physio_session.exercises: expected ≥3, got ${exercises.length}` }
      return { pass: true }
    },
  },

  // ── 6. Prehab ───────────────────────────────────────────────────────────────
  {
    name: '6. Prehab — hip activation routine',
    params: {
      title: 'Hip Prehab',
      workout_types: ['prehab'],
      workout_log: `Hip 90/90 stretch 3x60s each side
Glute bridge with band 3x15
Copenhagen plank 3x20s each side
Fire hydrant 3x12xg each leg`,
    },
    inspect: (r) => ({ session_type: r.session_type, physio: { subtype: r.physio_session?.session_subtype, exCount: r.physio_session?.exercises?.length } }),
    check: (r) => {
      if (r.session_type !== 'prehab') return { pass: false, reason: `session_type: expected "prehab", got "${r.session_type}"` }
      if (!r.physio_session) return { pass: false, reason: 'physio_session is null' }
      const hasContent = (r.physio_session.exercises?.length ?? 0) > 0 || (r.physio_session.body_areas?.length ?? 0) > 0
      if (!hasContent) return { pass: false, reason: 'physio_session has no exercises or body_areas' }
      return { pass: true }
    },
  },

  // ── 7. Conditioning ─────────────────────────────────────────────────────────
  {
    name: '7. Conditioning — E2MOM circuit',
    params: {
      title: 'E2MOM Circuit',
      workout_types: ['conditioning'],
      workout_log: `E2MOM × 10 rounds:
5 burpees
10 KB swings 24kg
15 air squats`,
    },
    inspect: (r) => ({ session_type: r.session_type, blocks: r.blocks?.map(b => ({ name: b.block_name, type: b.block_type, emom: b.emom_interval_seconds })) }),
    check: (r) => {
      if (r.session_type !== 'conditioning') return { pass: false, reason: `session_type: expected "conditioning", got "${r.session_type}"` }
      if (!r.blocks || r.blocks.length < 1) return { pass: false, reason: 'blocks is empty' }
      const emomBlock = r.blocks.find(b => b.block_type === 'emom' || (b.emom_interval_seconds != null && b.emom_interval_seconds > 0))
      if (!emomBlock) return { pass: false, reason: 'no block with block_type "emom" or emom_interval_seconds set' }
      const exercises = emomBlock.exercises
      if (exercises.length < 3) return { pass: false, reason: `EMOM block exercises: expected ≥3, got ${exercises.length}` }
      return { pass: true }
    },
  },

  // ── 8. Recovery ─────────────────────────────────────────────────────────────
  {
    name: '8. Recovery — easy walk + foam rolling',
    params: {
      title: 'Active Recovery',
      workout_types: ['recovery'],
      workout_log: `30 min easy walk
Foam rolling quads + hamstrings 10 min
Static stretching 15 min`,
    },
    inspect: (r) => ({ session_type: r.session_type, intensity: r.summary.estimated_intensity }),
    check: (r) => {
      if (r.session_type !== 'recovery') return { pass: false, reason: `session_type: expected "recovery", got "${r.session_type}"` }
      const intensity = r.summary.estimated_intensity
      if (intensity !== 'low') return { pass: false, reason: `estimated_intensity: expected "low", got "${intensity}"` }
      return { pass: true }
    },
  },

  // ── 9. Mixed ────────────────────────────────────────────────────────────────
  {
    name: '9. Mixed — strength + sprint in same session',
    params: {
      title: 'Morning session',
      workout_types: ['strength', 'sprint'],
      workout_log: `Track:
4×60m acceleration @ 85%

Gym:
Power clean 4x3@90
Back squat 4x4@120
Hang pull 3x5@100`,
    },
    inspect: (r) => ({ session_type: r.session_type, sprintEfforts: r.sprint_session?.efforts.length, blockCount: r.blocks?.length }),
    check: (r) => {
      if (r.session_type !== 'mixed') return { pass: false, reason: `session_type: expected "mixed", got "${r.session_type}"` }
      if (!r.sprint_session || r.sprint_session.efforts.length < 1) return { pass: false, reason: 'sprint_session.efforts is empty' }
      if (!r.blocks || r.blocks.length < 1) return { pass: false, reason: 'blocks is empty' }
      return { pass: true }
    },
  },

  // ── 10. Unknown ─────────────────────────────────────────────────────────────
  {
    name: '10. Unknown — unrecognisable input',
    params: {
      title: '',
      workout_types: [],
      workout_log: '???',
    },
    inspect: (r) => ({ session_type: r.session_type, notes: r.summary.session_notes }),
    check: (r) => {
      if (r.session_type !== 'unknown') return { pass: false, reason: `session_type: expected "unknown", got "${r.session_type}"` }
      if (!r.summary) return { pass: false, reason: 'summary is missing' }
      return { pass: true }
    },
  },
]

// ─── Runner ───────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║    AI Workout Parser v2 — AthleteSessionLog Test Suite       ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')

  let passed = 0
  let failed = 0

  for (const test of TESTS) {
    process.stdout.write(`  ${test.name}\n    → `)
    const result = await parse(test.params)

    if (!result) {
      console.log('❌  FAIL — parse returned null (check API key / model error above)')
      failed++
      continue
    }

    const { pass, reason } = test.check(result)
    const inspected = test.inspect(result)

    if (pass) {
      console.log(`✅  PASS  (confidence: ${((result.summary.parser_confidence ?? 1) * 100).toFixed(0)}%)`)
      console.log('    ' + JSON.stringify(inspected))
      passed++
    } else {
      console.log(`❌  FAIL — ${reason}`)
      console.log('    Inspected:', JSON.stringify(inspected, null, 2).split('\n').map(l => '    ' + l).join('\n'))
      failed++
    }
    console.log()
  }

  console.log('──────────────────────────────────────────────────────────────')
  console.log(`  Results: ${passed} passed, ${failed} failed out of ${TESTS.length} tests`)
  console.log('──────────────────────────────────────────────────────────────\n')

  process.exit(failed > 0 ? 1 : 0)
}

run()
