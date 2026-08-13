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
  const [{ count: followerCount, error: followerError }, { count: followingCount, error: followingError }] = await Promise.all([
    authenticated.supabase
      .from('social_follows')
      .select('*', { count: 'exact', head: true })
      .eq('followee_id', userId),
    authenticated.supabase
      .from('social_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ])
  if (followerError || followingError) return socialFailure(followerError?.message ?? followingError!.message, 500)
  return socialJson(ok({ followerCount: followerCount ?? 0, followingCount: followingCount ?? 0 }))
}

