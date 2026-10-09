import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'

type Context = { params: Promise<{ userId: string }> }

function handleOPTIONS() {
  return socialOptions()
}

async function handleGET(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { userId } = await params
  const { data, error } = await authenticated.supabase
    .from('social_follows')
    .select('follower_id')
    .eq('follower_id', authenticated.userId)
    .eq('followee_id', userId)
    .maybeSingle()
  if (error) return socialFailure(error.message, 500)
  return socialJson(ok({ following: Boolean(data) }))
}


export const OPTIONS = observeApiRoute('/api/users/[userId]/is-following', 'OPTIONS', handleOPTIONS)
export const GET = observeApiRoute('/api/users/[userId]/is-following', 'GET', handleGET)
