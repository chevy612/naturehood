import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { decodeDateCursor, encodeDateCursor } from '@/lib/social/cursor'
import { feedResponse, ok } from '@/lib/social/api-response'
import { readLimit, socialErrorResponse, socialFailure, socialJson, socialOptions } from '@/lib/social/http'

type Context = { params: Promise<{ postId: string; commentId: string }> }
type CommentRpcRow = { comment: unknown; created_at: string; id: string }

export function OPTIONS() {
  return socialOptions()
}

export async function GET(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const { postId, commentId } = await params

  const { data: parent, error: parentError } = await authenticated.supabase
    .from('social_comments')
    .select('id')
    .eq('id', commentId)
    .eq('post_id', postId)
    .maybeSingle()
  if (parentError) return socialFailure(parentError.message, 500)
  if (!parent) return socialFailure(`Comment not found: ${commentId}`, 404)

  try {
    const limit = readLimit(request.nextUrl.searchParams.get('limit'))
    const cursorParam = request.nextUrl.searchParams.get('cursor')
    const cursor = cursorParam ? decodeDateCursor(cursorParam) : null
    const { data, error } = await authenticated.supabase.rpc('list_social_comments', {
      p_post_id: postId,
      p_parent_comment_id: commentId,
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

