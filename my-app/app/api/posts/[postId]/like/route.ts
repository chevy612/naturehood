import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'

type Context = { params: Promise<{ postId: string }> }

export function OPTIONS() {
  return socialOptions()
}

export async function POST(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { postId } = await params
  const { data, error } = await authenticated.supabase.rpc('toggle_social_post_like', { p_post_id: postId })
  if (error) {
    const status = error.message.includes('Post not found') ? 404 : 400
    return socialFailure(error.message, status)
  }
  return socialJson(ok({ liked: data }))
}

