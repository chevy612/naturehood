import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { decodeDateCursor, encodeDateCursor } from '@/lib/social/cursor'
import { feedResponse, ok } from '@/lib/social/api-response'
import { readLimit, socialErrorResponse, socialFailure, socialJson, socialOptions } from '@/lib/social/http'
import { toSocialCommentDto, type SocialCommentRow } from '@/lib/social/types'
import { parseCreateComment } from '@/lib/social/validation'

type Context = { params: Promise<{ postId: string }> }
type CommentRpcRow = { comment: unknown; created_at: string; id: string }

export function OPTIONS() {
  return socialOptions()
}

export async function POST(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { postId } = await params

  try {
    const payload = parseCreateComment(await request.json())
    const { data, error } = await authenticated.supabase
      .from('social_comments')
      .insert({
        post_id: postId,
        parent_comment_id: payload.parentCommentId ?? null,
        author_id: authenticated.userId,
        content: payload.content,
        images: payload.images ?? [],
        content_type: payload.contentType ?? null,
      })
      .select('id, post_id, parent_comment_id, author_id, content, images, content_type, created_at, like_count')
      .single()
    if (error || !data) {
      const status = error?.message.includes('Parent comment') || error?.message.includes('Post not found') ? 400 : 500
      return socialFailure(error?.message ?? 'Failed to create comment', status)
    }
    return socialJson(ok(toSocialCommentDto(data as SocialCommentRow), { status: 201 }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body'
    return socialFailure(message, 400)
  }
}

export async function GET(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { postId } = await params

  try {
    const limit = readLimit(request.nextUrl.searchParams.get('limit'))
    const cursorParam = request.nextUrl.searchParams.get('cursor')
    const cursor = cursorParam ? decodeDateCursor(cursorParam) : null
    const { data, error } = await authenticated.supabase.rpc('list_social_comments', {
      p_post_id: postId,
      p_parent_comment_id: null,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
      p_limit: limit + 1,
    })
    if (error) return socialFailure(error.message, 500)
    const rows = (data ?? []) as CommentRpcRow[]
    const hasNext = rows.length > limit
    const page = hasNext ? rows.slice(0, limit) : rows
    const last = page.at(-1)
    const nextCursor = hasNext && last ? encodeDateCursor({ createdAt: last.created_at, id: last.id }) : null
    return socialJson(ok(feedResponse(page.map((row) => row.comment), nextCursor)))
  } catch (error) {
    return socialErrorResponse(error)
  }
}

