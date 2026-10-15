import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialErrorResponse, socialFailure, socialJson, socialOptions } from '@/lib/social/http'

function handleOPTIONS() {
  return socialOptions()
}

async function handleGET(request: NextRequest) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  try {
    const { count, error } = await authenticated.supabase
      .from('social_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_user_id', authenticated.userId)
      .is('read_at', null)
    if (error) return socialFailure(error.message, 500)
    return socialJson(ok({ count: count ?? 0 }))
  } catch (error) {
    return socialErrorResponse(error)
  }
}

export const OPTIONS = observeApiRoute('/api/notifications/unread-count', 'OPTIONS', handleOPTIONS)
export const GET = observeApiRoute('/api/notifications/unread-count', 'GET', handleGET)
