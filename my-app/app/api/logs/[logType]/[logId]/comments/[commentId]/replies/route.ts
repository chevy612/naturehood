import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { socialFailure, socialOptions } from '@/lib/social/http'
import { LogTargetError, isUuid, listLogCommentsResponse, logRouteErrorResponse, parseLogTarget } from '@/lib/social/log-comments'

type Context = { params: Promise<{ logType: string; logId: string; commentId: string }> }

function handleOPTIONS() {
  return socialOptions()
}

async function handleGET(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const raw = await params

  try {
    const { logType, logId } = parseLogTarget(raw.logType, raw.logId)
    if (!isUuid(raw.commentId)) throw new LogTargetError('commentId must be a UUID')

    const { data: parent, error: parentError } = await authenticated.supabase
      .from('log_comments')
      .select('id')
      .eq('id', raw.commentId)
      .eq('log_type', logType)
      .eq('log_id', logId)
      .maybeSingle()
    if (parentError) return socialFailure(parentError.message, 500)
    if (!parent) return socialFailure(`Comment not found: ${raw.commentId}`, 404)

    return await listLogCommentsResponse(request, authenticated.supabase, logType, logId, raw.commentId)
  } catch (error) {
    return logRouteErrorResponse(error)
  }
}

export const OPTIONS = observeApiRoute('/api/logs/[logType]/[logId]/comments/[commentId]/replies', 'OPTIONS', handleOPTIONS)
export const GET = observeApiRoute('/api/logs/[logType]/[logId]/comments/[commentId]/replies', 'GET', handleGET)
