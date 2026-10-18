'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Avatar } from '@/app/components/platform/Avatar'
import { CommentComposer } from '@/app/components/platform/social/CommentComposer'
import { MealPostCard } from '@/app/components/platform/social/MealPostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { WorkoutAttachmentCard } from '@/app/components/platform/social/WorkoutAttachmentCard'
import type { EnrichedComment } from '@/lib/social/browser'
import { displayName, formatRelativeTime, profileHref, sans } from '@/lib/social/format'
import { isVideoUrl, readPostBody } from '@/lib/social/post-content'
import { fetchCurrentUserId } from '@/lib/team/browser'
import { createLogComment, deleteLogComment, fetchLogComments, fetchLogReplies } from '@/lib/team/log-comments-browser'
import type { LogType } from '@/lib/team/types'

function countAll(items: EnrichedComment[]): number {
  return items.reduce((total, item) => total + 1 + countAll(item.replies ?? []), 0)
}

function removeFrom(items: EnrichedComment[], id: string): EnrichedComment[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      const replies = item.replies ? removeFrom(item.replies, id) : item.replies
      const removed = (item.replies?.length ?? 0) - (replies?.length ?? 0)
      return { ...item, replies, replyCount: Math.max(0, item.replyCount - removed) }
    })
}

export function LogCommentsPanel({
  logType,
  logId,
  athleteId,
  onCountChange,
}: {
  logType: LogType
  logId: string
  athleteId: string
  onCountChange?: (count: number) => void
}) {
  const [comments, setComments] = useState<EnrichedComment[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<EnrichedComment | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchLogComments(logType, logId), fetchCurrentUserId()])
      .then(([page, id]) => {
        if (cancelled) return
        setComments(page.data)
        setCursor(page.nextCursor)
        setHasNext(page.hasNext)
        setUserId(id)
        setError(null)
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load comments.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [logType, logId])

  useEffect(() => {
    onCountChange?.(countAll(comments))
  }, [comments, onCountChange])

  const updateComment = useCallback((commentId: string, updater: (comment: EnrichedComment) => EnrichedComment) => {
    const walk = (items: EnrichedComment[]): EnrichedComment[] => items.map((item) => (
      item.id === commentId ? updater(item) : { ...item, replies: item.replies ? walk(item.replies) : item.replies }
    ))
    setComments((current) => walk(current))
  }, [])

  function handleCreated(created: EnrichedComment, parent: EnrichedComment | null) {
    if (parent) {
      updateComment(parent.id, (item) => ({
        ...item,
        replyCount: item.replyCount + 1,
        replies: [...(item.replies ?? []), created],
      }))
    } else {
      setComments((current) => [...current, created])
    }
    setReplyTo(null)
    setActionError(null)
  }

  async function handleLoadMore() {
    if (!cursor) return
    try {
      const page = await fetchLogComments(logType, logId, cursor)
      setComments((current) => [...current, ...page.data])
      setCursor(page.nextCursor)
      setHasNext(page.hasNext)
    } catch (loadError) {
      setActionError(loadError instanceof Error ? loadError.message : 'Could not load more comments.')
    }
  }

  async function handleShowReplies(comment: EnrichedComment) {
    try {
      const replies = await fetchLogReplies(logType, logId, comment.id)
      updateComment(comment.id, (item) => ({ ...item, replies, replyCount: replies.length }))
    } catch (loadError) {
      setActionError(loadError instanceof Error ? loadError.message : 'Could not load replies.')
    }
  }

  async function handleDelete(comment: EnrichedComment) {
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteLogComment(logType, logId, comment.id)
      setComments((current) => removeFrom(current, comment.id))
      if (replyTo?.id === comment.id) setReplyTo(null)
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : 'Could not delete comment.')
    }
  }

  return (
    <div data-testid="log-comments">
      {loading ? <StatusMessage>Loading comments…</StatusMessage> : null}
      {!loading && error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
      {!loading && !error && comments.length === 0 ? (
        <StatusMessage>No comments yet. Start the conversation.</StatusMessage>
      ) : null}

      <div>
        {comments.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            canDeleteAny={userId === athleteId}
            userId={userId}
            onReply={(target) => {
              setReplyTo(target)
              setActionError(null)
            }}
            onDelete={handleDelete}
            onShowReplies={handleShowReplies}
          />
        ))}
      </div>

      {hasNext ? (
        <button type="button" onClick={handleLoadMore} className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[#A09EA3]" style={sans}>
          More comments
        </button>
      ) : null}

      {!error ? (
        <CommentComposer
          postId={logId}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onCreated={handleCreated}
          submitComment={(input) => createLogComment(logType, logId, input)}
          allowRecords={false}
          placeholder="Write a comment"
        />
      ) : null}
      {actionError ? <StatusMessage tone="error">{actionError}</StatusMessage> : null}
    </div>
  )
}

function CommentRow({
  comment,
  userId,
  canDeleteAny,
  onReply,
  onDelete,
  onShowReplies,
  nested = false,
}: {
  comment: EnrichedComment
  userId: string | null
  canDeleteAny: boolean
  onReply: (comment: EnrichedComment) => void
  onDelete: (comment: EnrichedComment) => void
  onShowReplies: (comment: EnrichedComment) => void
  nested?: boolean
}) {
  const body = readPostBody(comment)
  const name = displayName(comment.profile, comment.authorId)
  const canDelete = canDeleteAny || comment.authorId === userId
  const shownReplies = comment.replies?.length ?? 0
  return (
    <div className={nested ? 'mt-3 border-l border-[#3A373C] pl-3' : 'border-b border-[#3A373C] py-3'} data-testid="log-comment">
      <div className="flex gap-3">
        <Link href={profileHref(comment.profile, comment.authorId)} className="shrink-0">
          <Avatar name={name} photoUrl={comment.profile?.avatar_url} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <Link href={profileHref(comment.profile, comment.authorId)} className="truncate text-[13px] font-semibold text-white" style={sans}>
              {name}
            </Link>
            <time className="text-[12px] text-[#6B6870]" style={sans}>{formatRelativeTime(comment.createdAt)}</time>
          </div>
          {body.text ? <p className="mt-1 whitespace-pre-wrap break-words text-[14px] text-white" style={sans}>{body.text}</p> : null}
          {body.workout ? <div className="mt-2"><WorkoutAttachmentCard workout={body.workout} /></div> : null}
          {body.meal ? <div className="mt-2"><MealPostCard meal={body.meal} /></div> : null}
          {body.images.length > 0 ? (
            <div className="mt-2 grid w-full min-w-0 grid-cols-3 gap-2">
              {body.images.map((image) => (
                <div key={image} className="relative aspect-square w-full min-w-0 overflow-hidden rounded-lg bg-[#1E1B1F]">
                  {isVideoUrl(image) ? (
                    <video src={image} controls className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          ) : null}
          {(comment.videos ?? []).length > 0 ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {comment.videos.map((video) => (
                <video key={video} src={video} controls className="aspect-video w-full rounded-lg bg-black" />
              ))}
            </div>
          ) : null}
          <div className="mt-2 flex items-center gap-4">
            <button type="button" onClick={() => onReply(comment)} className="text-[12px] uppercase tracking-[0.12em] text-[#A09EA3]" style={sans}>
              Reply{comment.replyCount > 0 ? ` ${comment.replyCount}` : ''}
            </button>
            {canDelete ? (
              <button type="button" onClick={() => onDelete(comment)} className="text-[12px] uppercase tracking-[0.12em] text-[#6B6870] hover:text-[#FF4D4D]" style={sans}>
                Delete
              </button>
            ) : null}
          </div>
          {comment.replyCount > shownReplies ? (
            <button type="button" onClick={() => onShowReplies(comment)} className="mt-2 text-[12px] text-[#A09EA3] underline" style={sans}>
              View all {comment.replyCount} replies
            </button>
          ) : null}
          {comment.replies?.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              userId={userId}
              canDeleteAny={canDeleteAny}
              onReply={onReply}
              onDelete={onDelete}
              onShowReplies={onShowReplies}
              nested
            />
          ))}
        </div>
      </div>
    </div>
  )
}
