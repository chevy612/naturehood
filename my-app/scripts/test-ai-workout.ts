/**
 * AI Workout Parser — Integration Test Suite
 * Runs against the real Anthropic API using your .env.local key.
 *
 * Usage (from my-app/):
 *   npm run test:ai
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

// ─── Load .env.local ───────────────────────────────────────────────────────
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

// ─── Inline parser (mirrors lib/services/ai-workout.ts) ───────────────────
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a fitness log parser. Parse the workout description into structured JSON.
Return ONLY valid JSON matching this exact schema — no prose, no markdown, no code fences:
{
  "exercises": [
    {
      "name": "string (required)",
      "sets": "number (optional)",
      "reps": "number or string like '8-12' or 'max' (optional)",
      "weight_kg": "number (optional)",
      "distance_km": "number (optional)",
      "duration_seconds": "number (optional)",
      "notes": "string (optional)"
    }
  ],
  "summary": "string — one sentence describing the session (optional)",
  "estimated_intensity": "'low' | 'moderate' | 'high' (optional)"
}

Parsing rules:
- Convert lbs to kg (divide by 2.205, round to 1 decimal)
- Convert miles to km (multiply by 1.609, round to 2 decimals)
- European decimal commas: treat "167,5" as 167.5 — always emit decimal points, never commas, in JSON numbers
- If you cannot confidently parse a field, omit it rather than guess
- Always return at least one exercise entry if any activity is described
- If the input is empty or unrecognisable, return: {"exercises":[]}

Notation rules:
- "Distance *reps *sets" (e.g. "200m *3 *2"): sets=2, reps=3, distance_km=0.2. Rest/recovery info goes in notes.
- Parenthesised strength blocks "(NxWeight NxWeight ...)" (e.g. "(4x95 4x95 4x95 4x95)"): each block is one exercise. Count identical entries as sets, N as reps, Weight as weight_kg. If weights differ across entries use the most common or heaviest and note variation. Name unnamed exercises "Exercise 1", "Exercise 2", etc.
- Descending reps across sets (e.g. "11xlvl15 10xlvl15 8xlvl15"): sets=3, reps="11/10/8", omit weight_kg, put "Machine level 15" in notes.
- "xg" or "BW" suffix: bodyweight exercise — omit weight_kg, put "Bodyweight" in notes.
- "xlvlN" suffix: cable/machine at level N — omit weight_kg, put "Machine level N" in notes.
- "Ns max rep" or "Ns AMRAP" (e.g. "30s max rep"): duration_seconds=30, reps="max".
- "r:" or "rest:" lines/segments: put in notes of the preceding exercise, not a separate exercise entry.`

interface Exercise {
  name: string
  sets?: number
  reps?: number | string
  weight_kg?: number
  distance_km?: number
  duration_seconds?: number
  notes?: string
}

interface ParsedWorkout {
  exercises: Exercise[]
  summary?: string
  estimated_intensity?: 'low' | 'moderate' | 'high'
}

async function parse(raw: string): Promise<ParsedWorkout | null> {
  const text = raw.trim().replace(/(\d),(\d)/g, '$1.$2')
  if (!text) return { exercises: [] }
  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    })
    const block = msg.content[0]
    if (block.type !== 'text') return null
    // Strip markdown code fences the model sometimes adds despite instructions
    const jsonText = block.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    const parsed = JSON.parse(jsonText) as ParsedWorkout
    if (!Array.isArray(parsed.exercises)) return null
    return parsed
  } catch (err) {
    console.error('  parse error:', err)
    return null
  }
}

// ─── Test Cases ────────────────────────────────────────────────────────────

interface TestCase {
  name: string
  input: string
  check: (result: ParsedWorkout) => { pass: boolean; reason?: string }
}

const TESTS: TestCase[] = [
  // ── Standard format ──────────────────────────────────────────────────────
  {
    name: 'Standard: named exercises with sets×reps@weight',
    input: 'Squat 4x8 @ 100kg\nBench Press 3x10 @ 80kg\nDeadlift 3x5 @ 140kg',
    check: (r) => {
      if (r.exercises.length !== 3) return { pass: false, reason: `expected 3 exercises, got ${r.exercises.length}` }
      const squat = r.exercises[0]
      if (squat.sets !== 4) return { pass: false, reason: `squat sets: expected 4, got ${squat.sets}` }
      if (squat.reps !== 8) return { pass: false, reason: `squat reps: expected 8, got ${squat.reps}` }
      if (squat.weight_kg !== 100) return { pass: false, reason: `squat weight: expected 100, got ${squat.weight_kg}` }
      return { pass: true }
    },
  },

  // ── Sprint / distance with *reps *sets notation ───────────────────────
  {
    name: 'Sprint intervals: 200m *3 *2 notation',
    input: '200m *3 *2, rest: walk 100m between rep and 5mins between set',
    check: (r) => {
      if (r.exercises.length < 1) return { pass: false, reason: 'no exercises parsed' }
      const ex = r.exercises[0]
      if (ex.distance_km !== 0.2) return { pass: false, reason: `distance_km: expected 0.2, got ${ex.distance_km}` }
      if (ex.sets !== 2) return { pass: false, reason: `sets: expected 2, got ${ex.sets}` }
      if (ex.reps !== 3) return { pass: false, reason: `reps: expected 3, got ${ex.reps}` }
      const hasRestInfo = ex.notes && (ex.notes.toLowerCase().includes('rest') || ex.notes.toLowerCase().includes('walk') || ex.notes.toLowerCase().includes('between'))
      if (!hasRestInfo) return { pass: false, reason: 'rest info missing from notes' }
      return { pass: true }
    },
  },

  // ── Core / timed AMRAP ───────────────────────────────────────────────────
  {
    name: 'Core circuit: timed max-rep exercises',
    input: 'leg raise 30s max rep\nmountain bike core 30s max rep\nreversed cycle 30s max rep',
    check: (r) => {
      if (r.exercises.length !== 3) return { pass: false, reason: `expected 3 exercises, got ${r.exercises.length}` }
      for (const ex of r.exercises) {
        if (ex.duration_seconds !== 30) return { pass: false, reason: `${ex.name}: duration_seconds expected 30, got ${ex.duration_seconds}` }
        if (ex.reps !== 'max') return { pass: false, reason: `${ex.name}: reps expected "max", got "${ex.reps}"` }
      }
      return { pass: true }
    },
  },

  // ── Parenthesised blocks with European decimals ───────────────────────────
  {
    name: 'Strength blocks: parenthesised NxWeight with European decimal',
    input: '(4x95 4x95 4x95 4x95)\n(4x167,5 4x167,5 4x167,5)\n(6x120 6x120 6x120)',
    check: (r) => {
      if (r.exercises.length < 3) return { pass: false, reason: `expected ≥3 exercises, got ${r.exercises.length}` }
      const [ex1, ex2, ex3] = r.exercises
      if (ex1.weight_kg !== 95) return { pass: false, reason: `exercise 1 weight: expected 95, got ${ex1.weight_kg}` }
      if (ex2.weight_kg !== 167.5) return { pass: false, reason: `exercise 2 weight: expected 167.5, got ${ex2.weight_kg}` }
      if (ex3.weight_kg !== 120) return { pass: false, reason: `exercise 3 weight: expected 120, got ${ex3.weight_kg}` }
      return { pass: true }
    },
  },

  // ── xlvlN (cable machine) ───────────────────────────────────────────────
  {
    name: 'Cable machine: xlvlN notation, descending reps',
    input: '11xlvl15 10xlvl15 8xlvl15',
    check: (r) => {
      if (r.exercises.length < 1) return { pass: false, reason: 'no exercises' }
      const ex = r.exercises[0]
      if (ex.weight_kg !== undefined) return { pass: false, reason: `weight_kg should be omitted for machine levels, got ${ex.weight_kg}` }
      if (!ex.notes?.toLowerCase().includes('15')) return { pass: false, reason: `level 15 not in notes: "${ex.notes}"` }
      return { pass: true }
    },
  },

  // ── xg / bodyweight ────────────────────────────────────────────────────
  {
    name: 'Bodyweight: xg notation',
    input: '5xg 5xg 5xg',
    check: (r) => {
      if (r.exercises.length < 1) return { pass: false, reason: 'no exercises' }
      const ex = r.exercises[0]
      if (ex.weight_kg !== undefined) return { pass: false, reason: `weight_kg should be omitted for bodyweight, got ${ex.weight_kg}` }
      const notesOrName = (ex.notes ?? '' + ex.name ?? '').toLowerCase()
      if (!notesOrName.includes('body') && !notesOrName.includes('bw') && !notesOrName.includes('gravity')) {
        return { pass: false, reason: `bodyweight not noted: name="${ex.name}" notes="${ex.notes}"` }
      }
      return { pass: true }
    },
  },

  // ── lbs conversion ─────────────────────────────────────────────────────
  {
    name: 'Unit conversion: lbs → kg',
    input: 'Bench Press 3x10 @ 225lbs',
    check: (r) => {
      if (r.exercises.length < 1) return { pass: false, reason: 'no exercises' }
      const ex = r.exercises[0]
      const expected = Math.round(225 / 2.205 * 10) / 10  // 102.0
      if (!ex.weight_kg) return { pass: false, reason: 'weight_kg missing' }
      if (Math.abs(ex.weight_kg - expected) > 1) return { pass: false, reason: `weight: expected ≈${expected}kg, got ${ex.weight_kg}kg` }
      return { pass: true }
    },
  },

  // ── miles → km ─────────────────────────────────────────────────────────
  {
    name: 'Unit conversion: miles → km',
    input: '5 mile run, easy pace',
    check: (r) => {
      if (r.exercises.length < 1) return { pass: false, reason: 'no exercises' }
      const ex = r.exercises[0]
      const expected = 5 * 1.609  // 8.05
      if (!ex.distance_km) return { pass: false, reason: 'distance_km missing' }
      if (Math.abs(ex.distance_km - expected) > 0.1) return { pass: false, reason: `distance: expected ≈${expected}km, got ${ex.distance_km}km` }
      return { pass: true }
    },
  },

  // ── Rep ranges ──────────────────────────────────────────────────────────
  {
    name: 'Rep ranges: 8-12 string format',
    input: 'Lat Pulldown 3x8-12 @ 60kg',
    check: (r) => {
      if (r.exercises.length < 1) return { pass: false, reason: 'no exercises' }
      const ex = r.exercises[0]
      if (typeof ex.reps !== 'string' || !ex.reps.includes('-')) {
        return { pass: false, reason: `reps should be a range string, got "${ex.reps}"` }
      }
      return { pass: true }
    },
  },

  // ── Empty / unrecognisable input ────────────────────────────────────────
  {
    name: 'Empty input → empty exercises array',
    input: '',
    check: (r) => {
      if (!Array.isArray(r.exercises) || r.exercises.length !== 0) {
        return { pass: false, reason: `expected [], got ${JSON.stringify(r.exercises)}` }
      }
      return { pass: true }
    },
  },

  // ── Full real-world log (mixed) ─────────────────────────────────────────
  {
    name: 'Real log: full strength session (from DB)',
    input: '(4x95 4x95 4x95 4x95)\n(4x167,5 4x167,5 4x167,5)\n(6x120 6x120 6x120)\n(11xlvl15 10xlvl15 8xlvl15)\n(5xg 5xg 5xg)',
    check: (r) => {
      if (r.exercises.length < 5) return { pass: false, reason: `expected 5 exercise blocks, got ${r.exercises.length}` }
      if (!r.estimated_intensity) return { pass: false, reason: 'estimated_intensity missing' }
      return { pass: true }
    },
  },
]

// ─── Runner ─────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║      AI Workout Parser — Integration Test Suite          ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  let passed = 0
  let failed = 0

  for (const test of TESTS) {
    process.stdout.write(`  ${test.name}\n    → `)
    const result = await parse(test.input)

    if (!result) {
      console.log('❌  FAIL — parse returned null (check API key / model error above)')
      failed++
      continue
    }

    const { pass, reason } = test.check(result)
    if (pass) {
      console.log('✅  PASS')
      passed++
    } else {
      console.log(`❌  FAIL — ${reason}`)
      console.log('    Raw output:', JSON.stringify(result, null, 2).split('\n').map(l => '    ' + l).join('\n'))
      failed++
    }
  }

  console.log('\n──────────────────────────────────────────────────────────')
  console.log(`  Results: ${passed} passed, ${failed} failed out of ${TESTS.length} tests`)
  console.log('──────────────────────────────────────────────────────────\n')

  process.exit(failed > 0 ? 1 : 0)
}

run()
