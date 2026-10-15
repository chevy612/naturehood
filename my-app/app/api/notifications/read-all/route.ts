import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialErrorResponse, socialFailure, socialJson, socialOptions } from '@/lib/social/http'

function handleOPTIONS() {
  return socialOptions()
}

async function handlePUT(request: NextRequest) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  try {
    const { data, error } = await authenticated.supabase
      .from('social_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_user_id', authenticated.userId)
      .is('read_at', null)
      .select('id')
    if (error) return socialFailure(error.message, 500)
    return socialJson(ok({ updated: data?.length ?? 0 }))
  } catch (error) {
    return socialErrorResponse(error)
  }
}

export const OPTIONS = observeApiRoute('/api/notifications/read-all', 'OPTIONS', handleOPTIONS)
export const PUT = observeApiRoute('/api/notifications/read-all', 'PUT', handlePUT)
