import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { formatWorkoutWithAI } from '@/lib/services/ai-workout'
import { normalizeAiLanguage } from '@/lib/services/ai-language'
import { persistNormalizedSession } from '@/lib/services/session-persist'
import type { AthleteSessionLog } from '@/lib/types'
import logger from '@/lib/logger'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  // Auth check — support both cookie auth (web) and Bearer token auth (mobile)
  const authHeader = req.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  // For mobile (Bearer token): create a client with the token in the Authorization header
  // so that RLS policies resolve auth.uid() correctly on every DB query.
  // For web (cookie): use the standard SSR client.
  const supabase = bearerToken
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
      )
    : await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  const userId = user?.id

  logger.debug('[format-workout-route] Auth user:', userId ?? 'null — UNAUTHORIZED')
  logger.debug('[format-workout-route] Auth error:', authError?.message ?? 'none')

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS })
  }

  const body = await req.json()
  const { id, lang } = body as { id?: string; lang?: string }

  if (!id) {
    return NextResponse.json({ error: 'Missing workout id' }, { status: 400, headers: CORS_HEADERS })
  }

  // Fetch the workout — ownership enforced via RLS (user_id = auth.uid())
  const { data: log, error: fetchError } = await supabase
    .from('training_logs')
    .select('id, workout_log, title, workout_types, duration_minutes, user_id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !log) {
    return NextResponse.json({ error: 'Workout not found' }, { status: 404, headers: CORS_HEADERS })
  }

  if (!log.workout_log?.trim()) {
    return NextResponse.json({ error: 'No workout log text to format' }, { status: 422, headers: CORS_HEADERS })
  }

  const structured = await formatWorkoutWithAI({
    workout_log: log.workout_log,
    title: log.title ?? undefined,
    workout_types: log.workout_types ?? [],
    duration_minutes: log.duration_minutes ?? undefined,
    lang: normalizeAiLanguage(lang),
  })

  logger.debug('[AI] structured output:', JSON.stringify(structured, null, 2))

  if (!structured) {
    return NextResponse.json({ error: 'AI formatting failed' }, { status: 500, headers: CORS_HEADERS })
  }

  // Write result back to the row; clear stale flag if set
  const { error: updateError } = await supabase
    .from('training_logs')
    .update({
      ai_structured: structured,
      ai_formatted_at: new Date().toISOString(),
      ai_needs_refresh: false,
    })
    .eq('id', id)
    .eq('user_id', userId)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save AI result' }, { status: 500, headers: CORS_HEADERS })
  }

  // Persist to normalized tables (V2 schema only — skip V1 fallbacks)
  if ('parser_version' in structured) {
    await persistNormalizedSession(supabase, id, userId, structured as AthleteSessionLog)
  }

  return NextResponse.json({ structured }, { headers: CORS_HEADERS })
}
