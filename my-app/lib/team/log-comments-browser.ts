'use client'

import {
  collectCommentAuthorIds,
  enrichComments,
  fetchProfiles,
  socialFetch,
  type EnrichedComment,
  type FeedPage,
} from '@/lib/social/browser'
import type { LogCommentDto } from '@/lib/social/types'
import type { LogType } from '@/lib/team/types'

const base = (logType: LogType, logId: string) => `/api/logs/${logType}/${logId}/comments`

async function enrichPage(page: FeedPage<LogCommentDto>): Promise<FeedPage<EnrichedComment>> {
  const ids = new Set<string>()
  collectCommentAuthorIds(page.data, ids)
  const profiles = await fetchProfiles([...ids])
  return { ...page, data: enrichComments(page.data, profiles) }
}

export async function fetchLogComments(logType: LogType, logId: string, cursor?: string | null) {
  const params = new URLSearchParams({ limit: '20' })
  if (cursor) params.set('cursor', cursor)
  return enrichPage(await socialFetch<FeedPage<LogCommentDto>>(`${base(logType, logId)}?${params}`))
}

export async function fetchLogReplies(logType: LogType, logId: string, commentId: string) {
  const page = await socialFetch<FeedPage<LogCommentDto>>(`${base(logType, logId)}/${commentId}/replies?limit=50`)
  return (await enrichPage(page)).data
}

export async function createLogComment(
  logType: LogType,
  logId: string,
  input: { content: string; parentCommentId?: string | null; images?: string[]; videos?: string[]; contentType?: string }
): Promise<EnrichedComment> {
  const comment = await socialFetch<LogCommentDto>(base(logType, logId), {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const profiles = await fetchProfiles([comment.authorId])
  return enrichComments([comment], profiles)[0]
}

export async function deleteLogComment(logType: LogType, logId: string, commentId: string): Promise<void> {
  await socialFetch<unknown>(`${base(logType, logId)}/${commentId}`, { method: 'DELETE' })
}
