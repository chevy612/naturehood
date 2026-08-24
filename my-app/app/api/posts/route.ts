import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'
import { ok } from '@/lib/social/api-response'
import { toSocialPostDto, type SocialPostRow } from '@/lib/social/types'
import { parseCreatePost } from '@/lib/social/validation'

export function OPTIONS() {
  return socialOptions()
}

export async function POST(request: NextRequest) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  try {
    const payload = parseCreatePost(await request.json())
    const { data, error } = await authenticated.supabase
      .from('social_posts')
      .insert({
        author_id: authenticated.userId,
        content: payload.content ?? null,
        images: payload.images ?? [],
        content_type: payload.contentType ?? null,
      })
      .select('id, author_id, content, images, content_type, created_at, like_count, comment_count, repost_count')
      .single()

    if (error || !data) return socialFailure(error?.message ?? 'Failed to create post', 500)
    return socialJson(ok(toSocialPostDto(data as SocialPostRow), { status: 201 }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body'
    return socialFailure(message, 400)
  }
}
