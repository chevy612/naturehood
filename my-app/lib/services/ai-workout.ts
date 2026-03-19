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
      "reps": "number or string like '8-12' (optional)",
      "weight_kg": "number (optional)",
      "distance_km": "number (optional)",
      "duration_seconds": "number (optional)",
      "notes": "string (optional)"
    }
  ],
  "summary": "string — one sentence describing the session (optional)",
  "estimated_intensity": "'low' | 'moderate' | 'high' (optional)"
}
Rules:
- Convert lbs to kg (divide by 2.205, round to 1 decimal)
- Convert miles to km (multiply by 1.609, round to 2 decimals)
- If you cannot confidently parse a field, omit it rather than guess
- Always return at least one exercise entry if any activity is described
- If the input is empty or unrecognisable, return: {"exercises":[]}`

export async function formatWorkoutWithAI(
  workoutLogText: string
): Promise<AiStructuredWorkout | null> {
  if (!workoutLogText?.trim()) return null

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: workoutLogText.trim() }],
    })

    const raw = message.content[0]
    if (raw.type !== 'text') return null

    const parsed: AiStructuredWorkout = JSON.parse(raw.text)

    // Minimal validation — must have an exercises array
    if (!Array.isArray(parsed.exercises)) return null

    return parsed
  } catch {
    // Swallow all errors — AI is a progressive enhancement, never a hard dependency
    return null
  }
}
