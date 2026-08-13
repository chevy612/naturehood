import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { readLimit, socialErrorResponse, socialFailure, socialJson, socialOptions } from '@/lib/social/http'

export function OPTIONS() {
  return socialOptions()
}

export async function GET(request: NextRequest) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  try {
    const limit = readLimit(request.nextUrl.searchParams.get('limit'), 20, 50)
    const { data, error } = await authenticated.supabase
      .from('social_notifications')
      .select('id, actor_user_id, type, post_id, comment_id, created_at, read_at')
      .eq('recipient_user_id', authenticated.userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) return socialFailure(error.message, 500)
    return socialJson(ok((data ?? []).map((notification) => ({
      id: notification.id,
      actorUserId: notification.actor_user_id,
      type: notification.type,
      postId: notification.post_id,
      commentId: notification.comment_id,
      createdAt: notification.created_at,
      readAt: notification.read_at,
    }))))
  } catch (error) {
    return socialErrorResponse(error)
  }
}

