import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { tracedRpc } from '@/lib/observability/dependencies'
import { feedResponse, ok } from './api-response'
import { decodeDateCursor, encodeDateCursor } from './cursor'
import { readLimit, socialErrorResponse, socialFailure, socialJson } from './http'
import type { LogType } from './types'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export class LogTargetError extends Error {}

export function parseLogTarget(logType: string, logId: string): { logType: LogType; logId: string } {
  if (logType !== 'workout' && logType !== 'meal') throw new LogTargetError('logType must be workout or meal')
  if (!UUID_PATTERN.test(logId)) throw new LogTargetError('logId must be a UUID')
  return { logType, logId }
}

export function logRouteErrorResponse(error: unknown) {
  if (error instanceof LogTargetError) return socialFailure(error.message, 400)
  return socialErrorResponse(error)
}

export function isUuid(value: string) {
  return UUID_PATTERN.test(value)
}

/**
 * Resolves the owner of a log through the caller's own RLS view. A Coach can only see the log
 * (and therefore its owner) when an accepted share covers it, so this doubles as an access check.
 */
export async function findLogOwner(supabase: SupabaseClient, logType: LogType, logId: string) {
  const query = logType === 'workout'
    ? supabase.from('training_logs').select('user_id').eq('id', logId).eq('is_deleted', false)
    : supabase.from('meal_records').select('user_id').eq('meal_id', logId)
  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(error.message)
  return (data as { user_id: string } | null)?.user_id ?? null
}

type PostgrestLikeError = { code?: string; message: string }

/** Maps log_comments database errors (see migration 012) to HTTP responses. */
export function logCommentErrorResponse(error: PostgrestLikeError) {
  if (error.message === 'log_not_found') return socialFailure('Log not found', 404)
  if (error.message === 'parent_comment_invalid') return socialFailure('Parent comment does not belong to this log', 400)
  if (error.message === 'invalid_log_type') return socialFailure('logType must be workout or meal', 400)
  if (error.code === '42501') return socialFailure('You do not have access to comment on this log', 403)
  if (error.code === '23514' || error.code === '22023') return socialFailure(error.message, 400)
  return socialFailure(error.message, 500)
}

type CommentRpcRow = { comment: unknown; created_at: string; id: string }

/** Cursor-paged `list_log_comments`; RLS makes an out-of-scope or revoked Coach see an empty page. */
export async function listLogCommentsResponse(
  request: NextRequest,
  supabase: SupabaseClient,
  logType: LogType,
  logId: string,
  parentCommentId: string | null
) {
  const limit = readLimit(request.nextUrl.searchParams.get('limit'))
  const cursorParam = request.nextUrl.searchParams.get('cursor')
  const cursor = cursorParam ? decodeDateCursor(cursorParam) : null
  const { data, error } = await tracedRpc(supabase, 'list_log_comments', {
    p_log_type: logType,
    p_log_id: logId,
    p_parent_comment_id: parentCommentId,
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
}
