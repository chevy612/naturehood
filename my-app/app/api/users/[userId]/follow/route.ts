import { observeApiRoute } from '@/lib/observability/with-api-route'
import { tracedRpc } from '@/lib/observability/dependencies'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'

type Context = { params: Promise<{ userId: string }> }

function handleOPTIONS() {
  return socialOptions()
}

async function handlePUT(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { userId } = await params
  const { error } = await tracedRpc(authenticated.supabase, 'follow_social_user', { p_user_id: userId })
  if (error) return socialFailure(error.message, 400)
  return socialJson(ok({ following: true }))
}

async function handleDELETE(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { userId } = await params
  const { error } = await tracedRpc(authenticated.supabase, 'unfollow_social_user', { p_user_id: userId })
  if (error) return socialFailure(error.message, 500)
  return socialJson(ok({ following: false }))
}


export const OPTIONS = observeApiRoute('/api/users/[userId]/follow', 'OPTIONS', handleOPTIONS)
export const PUT = observeApiRoute('/api/users/[userId]/follow', 'PUT', handlePUT)
export const DELETE = observeApiRoute('/api/users/[userId]/follow', 'DELETE', handleDELETE)
