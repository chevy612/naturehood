import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'
import {
  findLogOwner,
  isUuid,
  listLogCommentsResponse,
  logCommentErrorResponse,
  logRouteErrorResponse,
  parseLogTarget,
} from '@/lib/social/log-comments'
import { toLogCommentDto, type LogCommentRow } from '@/lib/social/types'
import { parseCreateComment } from '@/lib/social/validation'

type Context = { params: Promise<{ logType: string; logId: string }> }

function handleOPTIONS() {
  return socialOptions()
}

async function handlePOST(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const raw = await params

  try {
    const { logType, logId } = parseLogTarget(raw.logType, raw.logId)
    const payload = parseCreateComment(await request.json())
    if (payload.parentCommentId && !isUuid(payload.parentCommentId)) {
      throw new Error('Request body parentCommentId must be a UUID')
    }

    const athleteId = await findLogOwner(authenticated.supabase, logType, logId)
    if (!athleteId) return socialFailure('Log not found', 404)

    const { data, error } = await authenticated.supabase
      .from('log_comments')
      .insert({
        log_type: logType,
        log_id: logId,
        athlete_id: athleteId,
        parent_comment_id: payload.parentCommentId ?? null,
        author_id: authenticated.userId,
        content: payload.content,
        images: payload.images ?? [],
        videos: payload.videos ?? [],
        content_type: payload.contentType ?? null,
      })
      .select('id, log_type, log_id, athlete_id, parent_comment_id, author_id, content, images, videos, content_type, created_at')
      .single()
    if (error || !data) {
      return error ? logCommentErrorResponse(error) : socialFailure('Failed to create comment', 500)
    }
    return socialJson(ok(toLogCommentDto(data as LogCommentRow), { status: 201 }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request body'
    return socialFailure(message, 400)
  }
}

async function handleGET(request: NextRequest, { params }: Context) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)
  const raw = await params

  try {
    const { logType, logId } = parseLogTarget(raw.logType, raw.logId)
    return await listLogCommentsResponse(request, authenticated.supabase, logType, logId, null)
  } catch (error) {
    return logRouteErrorResponse(error)
  }
}

export const OPTIONS = observeApiRoute('/api/logs/[logType]/[logId]/comments', 'OPTIONS', handleOPTIONS)
export const POST = observeApiRoute('/api/logs/[logType]/[logId]/comments', 'POST', handlePOST)
export const GET = observeApiRoute('/api/logs/[logType]/[logId]/comments', 'GET', handleGET)
