import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'

type Context = { params: Promise<{ userId: string }> }

export function OPTIONS() {
  return socialOptions()
}

export async function GET(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { userId } = await params
  const { data, error } = await authenticated.supabase
    .from('social_follows')
    .select('followee_id')
    .eq('follower_id', userId)
  if (error) return socialFailure(error.message, 500)
  return socialJson(ok({ followingIds: (data ?? []).map((follow) => follow.followee_id) }))
}

