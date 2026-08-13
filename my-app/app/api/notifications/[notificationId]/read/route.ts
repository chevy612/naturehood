import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'

type Context = { params: Promise<{ notificationId: string }> }

export function OPTIONS() {
  return socialOptions()
}

export async function PUT(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { notificationId } = await params
  const { data, error } = await authenticated.supabase
    .from('social_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('recipient_user_id', authenticated.userId)
    .select('id')
    .maybeSingle()
  if (error) return socialFailure(error.message, 500)
  if (!data) return socialFailure(`Notification not found: ${notificationId}`, 404)
  return socialJson(ok(null))
}

