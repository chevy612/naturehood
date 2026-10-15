import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'
import { LogTargetError, isUuid, logRouteErrorResponse, parseLogTarget } from '@/lib/social/log-comments'

type Context = { params: Promise<{ logType: string; logId: string; commentId: string }> }

function handleOPTIONS() {
  return socialOptions()
}

// RLS lets the author or the Athlete delete a comment; anyone else matches no row.
async function handleDELETE(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const raw = await params

  try {
    const { logType, logId } = parseLogTarget(raw.logType, raw.logId)
    if (!isUuid(raw.commentId)) throw new LogTargetError('commentId must be a UUID')
    const { data, error } = await authenticated.supabase
      .from('log_comments')
      .delete()
      .eq('id', raw.commentId)
      .eq('log_type', logType)
      .eq('log_id', logId)
      .select('id')
    if (error) return socialFailure(error.message, 500)
    if (!data?.length) return socialFailure(`Comment not found: ${raw.commentId}`, 404)
    return socialJson(ok(null))
  } catch (error) {
    return logRouteErrorResponse(error)
  }
}

export const OPTIONS = observeApiRoute('/api/logs/[logType]/[logId]/comments/[commentId]', 'OPTIONS', handleOPTIONS)
export const DELETE = observeApiRoute('/api/logs/[logType]/[logId]/comments/[commentId]', 'DELETE', handleDELETE)
