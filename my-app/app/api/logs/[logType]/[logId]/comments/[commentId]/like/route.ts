import { observeApiRoute } from '@/lib/observability/with-api-route'
import { tracedRpc } from '@/lib/observability/dependencies'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { isUuid, logRouteErrorResponse, parseLogTarget } from '@/lib/social/log-comments'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'

type Context = { params: Promise<{ logType: string; logId: string; commentId: string }> }

function handleOPTIONS() {
  return socialOptions()
}

async function handlePOST(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  try {
    const raw = await params
    const { logType, logId } = parseLogTarget(raw.logType, raw.logId)
    if (!isUuid(raw.commentId)) return socialFailure('commentId must be a UUID', 400)

    const { data: comment, error: lookupError } = await authenticated.supabase
      .from('log_comments')
      .select('id')
      .eq('id', raw.commentId)
      .eq('log_type', logType)
      .eq('log_id', logId)
      .maybeSingle()
    if (lookupError) return socialFailure(lookupError.message, 500)
    if (!comment) return socialFailure('Comment not found', 404)

    const { data, error } = await tracedRpc(authenticated.supabase, 'toggle_log_comment_like', {
      p_comment_id: raw.commentId,
    })
    if (error) {
      const status = error.message === 'comment_not_found' ? 404 : error.message === 'not_authenticated' ? 401 : 400
      return socialFailure(error.message, status)
    }
    return socialJson(ok({ liked: data }))
  } catch (error) {
    return logRouteErrorResponse(error)
  }
}

export const OPTIONS = observeApiRoute('/api/logs/[logType]/[logId]/comments/[commentId]/like', 'OPTIONS', handleOPTIONS)
export const POST = observeApiRoute('/api/logs/[logType]/[logId]/comments/[commentId]/like', 'POST', handlePOST)
