import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'
import { observeSupabaseAuth } from '@/lib/observability/supabase-auth'

async function handlePOST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userClient = observeSupabaseAuth(createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  ))

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

  // An Expo push token identifies one app install. A reinstall generates a new
  // deviceId but keeps the token, so drop stale rows that hold the same token
  // or every push would be delivered once per row.
  const { error: cleanupError } = await admin
    .from('push_tokens')
    .delete()
    .eq('expo_push_token', expoPushToken)
    .or(`user_id.neq.${user.id},device_id.neq.${deviceId}`)

  if (cleanupError) {
    return NextResponse.json({ error: 'Failed to register token' }, { status: 500 })
  }

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

export const POST = observeApiRoute('/api/notifications/register', 'POST', handlePOST)
