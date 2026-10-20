import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { readBefore, readLimit, socialErrorResponse, socialFailure, socialJson, socialOptions } from '@/lib/social/http'

function handleOPTIONS() {
  return socialOptions()
}

async function handleGET(request: NextRequest) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  try {
    const limit = readLimit(request.nextUrl.searchParams.get('limit'), 20, 50)
    const before = readBefore(request.nextUrl.searchParams.get('before'))
    let query = authenticated.supabase
      .from('social_notifications')
      .select('id, actor_user_id, type, post_id, comment_id, log_comment_id, log_type, log_id, athlete_id, created_at, read_at')
      .eq('recipient_user_id', authenticated.userId)
    // A recipient never gets two rows from one transaction, so created_at is a safe page cursor.
    if (before) query = query.lt('created_at', before)
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit)
    if (error) return socialFailure(error.message, 500)
    return socialJson(ok((data ?? []).map((notification) => ({
      id: notification.id,
      actorUserId: notification.actor_user_id,
      type: notification.type,
      postId: notification.post_id,
      commentId: notification.comment_id,
      logCommentId: notification.log_comment_id,
      logType: notification.log_type === 'workout' || notification.log_type === 'meal' ? notification.log_type : null,
      logId: notification.log_id,
      athleteId: notification.athlete_id,
      createdAt: notification.created_at,
      readAt: notification.read_at,
    }))))
  } catch (error) {
    return socialErrorResponse(error)
  }
}


export const OPTIONS = observeApiRoute('/api/notifications', 'OPTIONS', handleOPTIONS)
export const GET = observeApiRoute('/api/notifications', 'GET', handleGET)
