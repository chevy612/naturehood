import Anthropic from '@anthropic-ai/sdk'
import type { AiStructuredWorkout } from '@/lib/types'

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

export async function formatWorkoutWithAI(
  workoutLogText: string
): Promise<AiStructuredWorkout | null> {
  if (!workoutLogText?.trim()) return null

  try {
    // Normalise European decimal commas (e.g. "167,5" → "167.5") before sending
    const normalisedText = workoutLogText.trim().replace(/(\d),(\d)/g, '$1.$2')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: normalisedText }],
    })

    const raw = message.content[0]
    if (raw.type !== 'text') return null

    // Strip markdown code fences the model sometimes adds despite instructions
    const jsonText = raw.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    const parsed: AiStructuredWorkout = JSON.parse(jsonText)

    // Minimal validation — must have an exercises array
    if (!Array.isArray(parsed.exercises)) return null

    return parsed
  } catch (err) {
    console.error('[ai-workout] formatWorkoutWithAI failed:', err)
    return null
  }
}
