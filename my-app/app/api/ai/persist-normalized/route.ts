import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { persistNormalizedSession } from '@/lib/services/session-persist'
import type { AthleteSessionLog } from '@/lib/types'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(req: NextRequest) {
  // Auth — same Bearer token / cookie pattern as format-workout
  const authHeader = req.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const supabase = bearerToken
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
      )
    : await createClient()

  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS })
  }

  const body = await req.json()
  const { id } = body as { id?: string }

  if (!id) {
    return NextResponse.json({ error: 'Missing workout id' }, { status: 400, headers: CORS_HEADERS })
  }

  // Fetch training_log — ownership enforced via RLS
  const { data: log, error: fetchError } = await supabase
    .from('training_logs')
    .select('id, user_id, ai_structured')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !log) {
    return NextResponse.json({ error: 'Workout not found' }, { status: 404, headers: CORS_HEADERS })
  }

  if (!log.ai_structured || !('parser_version' in log.ai_structured)) {
    return NextResponse.json({ error: 'No V2 ai_structured data to persist' }, { status: 422, headers: CORS_HEADERS })
  }

  const { error: persistError } = await persistNormalizedSession(
    supabase,
    log.id,
    log.user_id,
    log.ai_structured as AthleteSessionLog
  )

  if (persistError) {
    return NextResponse.json({ error: persistError }, { status: 500, headers: CORS_HEADERS })
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS })
}