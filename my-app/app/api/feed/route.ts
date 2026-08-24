import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { decodeFeedCursor, encodeFeedCursor } from '@/lib/social/cursor'
import { feedResponse, ok } from '@/lib/social/api-response'
import { readLimit, socialErrorResponse, socialFailure, socialJson, socialOptions } from '@/lib/social/http'
import { toSocialPostDto, type SocialPostRow } from '@/lib/social/types'

export function OPTIONS() {
  return socialOptions()
}

export async function GET(request: NextRequest) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  try {
    const limit = readLimit(request.nextUrl.searchParams.get('limit'))
    const cursorParam = request.nextUrl.searchParams.get('cursor')
    const cursor = cursorParam ? decodeFeedCursor(cursorParam) : null
    const { data, error } = await authenticated.supabase.rpc('list_social_feed', {
      p_cursor_score: cursor?.score ?? null,
      p_cursor_created_at: cursor?.createdAt ?? null,
      p_cursor_id: cursor?.id ?? null,
      p_limit: limit + 1,
    })
    if (error) return socialFailure(error.message, 500)

    const rows = (data ?? []) as SocialPostRow[]
    const hasNext = rows.length > limit
    const page = hasNext ? rows.slice(0, limit) : rows
    const last = page.at(-1)
    const nextCursor = hasNext && last
      ? encodeFeedCursor({ score: last.rank_score ?? 0, createdAt: last.created_at, id: last.id })
      : null
    return socialJson(ok(feedResponse(page.map(toSocialPostDto), nextCursor)))
  } catch (error) {
    return socialErrorResponse(error)
  }
}

