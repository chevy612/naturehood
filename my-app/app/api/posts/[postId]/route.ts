import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'
import { toSocialPostDto, type SocialPostRow } from '@/lib/social/types'

type Context = { params: Promise<{ postId: string }> }

export function OPTIONS() {
  return socialOptions()
}

export async function GET(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { postId } = await params

  const [{ data: post, error }, { data: liked }] = await Promise.all([
    authenticated.supabase
      .from('social_posts')
      .select('id, author_id, content, images, content_type, created_at, like_count, comment_count, repost_count')
      .eq('id', postId)
      .is('deleted_at', null)
      .maybeSingle(),
    authenticated.supabase
      .from('social_post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', authenticated.userId)
      .maybeSingle(),
  ])
  if (error) return socialFailure(error.message, 500)
  if (!post) return socialFailure(`Post not found: ${postId}`, 404)
  return socialJson(ok(toSocialPostDto({ ...(post as SocialPostRow), liked_by_me: Boolean(liked) })))
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { postId } = await params

  const { data, error } = await authenticated.supabase
    .from('social_posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('author_id', authenticated.userId)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle()
  if (error) return socialFailure(error.message, 500)
  if (!data) return socialFailure(`Post not found or not authorized: ${postId}`, 404)
  return socialJson(ok(null))
}

