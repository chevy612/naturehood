import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await userClient.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { expoPushToken?: string; deviceId?: string; platform?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { expoPushToken, deviceId, platform } = body
  if (!expoPushToken || !deviceId || !platform) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('push_tokens')
    .upsert(
      { user_id: user.id, expo_push_token: expoPushToken, device_id: deviceId, platform, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,device_id' }
    )

  if (error) {
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
