import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'

type Context = { params: Promise<{ userId: string }> }

export function OPTIONS() {
  return socialOptions()
}

export async function PUT(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { userId } = await params
  const { error } = await authenticated.supabase.rpc('follow_social_user', { p_user_id: userId })
  if (error) return socialFailure(error.message, 400)
  return socialJson(ok({ following: true }))
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { userId } = await params
  const { error } = await authenticated.supabase.rpc('unfollow_social_user', { p_user_id: userId })
  if (error) return socialFailure(error.message, 500)
  return socialJson(ok({ following: false }))
}

