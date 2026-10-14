'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Heart } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { PostCard } from '@/app/components/platform/social/PostCard'
import { StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { MealPostCard } from '@/app/components/platform/social/MealPostCard'
import { WorkoutAttachmentCard } from '@/app/components/platform/social/WorkoutAttachmentCard'
import {
  createSocialComment,
  fetchComments,
  fetchPost,
  toggleCommentLike,
  togglePostLike,
  type EnrichedComment,
  type EnrichedPost,
} from '@/lib/social/browser'
import { displayName, formatRelativeTime, profileHref, sans } from '@/lib/social/format'
import { readPostBody } from '@/lib/social/post-content'

const MAX_COMMENT = 280

export function PostThread({ postId }: { postId: string }) {
  const router = useRouter()
  const [post, setPost] = useState<EnrichedPost | null>(null)
  const [comments, setComments] = useState<EnrichedComment[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<EnrichedComment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [likePending, setLikePending] = useState(false)
  const [pendingCommentLikes, setPendingCommentLikes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([fetchPost(postId), fetchComments(postId)])
      .then(([nextPost, page]) => {
        if (cancelled) return
        setPost(nextPost)
        setComments(page.data)
        setCursor(page.nextCursor)
        setHasNext(page.hasNext)
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load this post.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [postId])

  async function handleLike() {
    if (!post || likePending) return
    const previous = post
    setLikePending(true)
    setPost({ ...post, likedByMe: !post.likedByMe, likeCount: Math.max(0, post.likeCount + (post.likedByMe ? -1 : 1)) })
    try {
      const result = await togglePostLike(post.id)
      setPost({
        ...previous,
        likedByMe: result.liked,
        likeCount: Math.max(0, previous.likeCount + (result.liked === previous.likedByMe ? 0 : result.liked ? 1 : -1)),
      })
    } catch (likeError) {
      setPost(previous)
      setError(likeError instanceof Error ? likeError.message : 'Could not update like.')
    } finally {
      setLikePending(false)
    }
  }

  function updateComment(commentId: string, updater: (comment: EnrichedComment) => EnrichedComment) {
    const walk = (items: EnrichedComment[]): EnrichedComment[] => items.map((item) => {
      if (item.id === commentId) return updater(item)
      return { ...item, replies: item.replies ? walk(item.replies) : item.replies }
    })
    setComments((current) => walk(current))
  }

  async function handleCommentLike(comment: EnrichedComment) {
    if (pendingCommentLikes[comment.id]) return
    const previousLiked = comment.likedByMe
    const previousCount = comment.likeCount
    setPendingCommentLikes((current) => ({ ...current, [comment.id]: true }))
    updateComment(comment.id, (item) => ({
      ...item,
      likedByMe: !item.likedByMe,
      likeCount: Math.max(0, item.likeCount + (item.likedByMe ? -1 : 1)),
    }))
    try {
      const result = await toggleCommentLike(postId, comment.id)
      updateComment(comment.id, (item) => ({
        ...item,
        likedByMe: result.liked,
        likeCount: Math.max(0, previousCount + (result.liked === previousLiked ? 0 : result.liked ? 1 : -1)),
      }))
    } catch (likeError) {
      updateComment(comment.id, (item) => ({ ...item, likedByMe: previousLiked, likeCount: previousCount }))
      setCommentError(likeError instanceof Error ? likeError.message : 'Could not update comment like.')
    } finally {
      setPendingCommentLikes((current) => ({ ...current, [comment.id]: false }))
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const content = draft.trim()
    if (!content || submitting) return
    if (content.length > MAX_COMMENT) {
      setCommentError(`Comments must be ${MAX_COMMENT} characters or fewer.`)
      return
    }
    setSubmitting(true)
    setCommentError(null)
    try {
      const created = await createSocialComment(postId, {
        content,
        parentCommentId: replyTo?.id ?? null,
        images: [],
        contentType: 'NORMAL_POST',
      })
      if (replyTo) {
        updateComment(replyTo.id, (item) => ({
          ...item,
          replyCount: item.replyCount + 1,
          replies: [...(item.replies ?? []), created],
        }))
      } else {
        setComments((current) => [...current, created])
      }
      setPost((current) => current ? { ...current, commentCount: current.commentCount + 1 } : current)
      setDraft('')
      setReplyTo(null)
      router.refresh()
    } catch (submitError) {
      setCommentError(submitError instanceof Error ? submitError.message : 'Could not post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLoadMore() {
    if (!cursor) return
    try {
      const page = await fetchComments(postId, cursor)
      setComments((current) => [...current, ...page.data])
      setCursor(page.nextCursor)
      setHasNext(page.hasNext)
    } catch (loadError) {
      setCommentError(loadError instanceof Error ? loadError.message : 'Could not load more comments.')
    }
  }

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.16em] text-[#A09EA3]"
          style={sans}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {loading ? <StatusMessage>Loading post…</StatusMessage> : null}
        {!loading && error && !post ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        {!loading && !post && !error ? <StatusMessage>This post is no longer available.</StatusMessage> : null}

        {post ? (
          <PostCard post={post} linked={false} likePending={likePending} onLike={handleLike} />
        ) : null}

        <h2 className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F5F5F5]" style={sans}>
          Replies
        </h2>

        {!loading && comments.length === 0 ? <StatusMessage>No replies yet.</StatusMessage> : null}
        <div className="mt-2">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              pendingIds={pendingCommentLikes}
              onLike={handleCommentLike}
              onReply={(target) => {
                setReplyTo(target)
                setCommentError(null)
              }}
            />
          ))}
        </div>
        {hasNext && (
          <button type="button" onClick={handleLoadMore} className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[#A09EA3]" style={sans}>
            More replies
          </button>
        )}

        <form onSubmit={handleSubmit} className="mt-6 border-t border-[#3A373C] pt-4">
          {replyTo ? (
            <div className="mb-3 flex items-center justify-between gap-3 text-[12px] text-[#A09EA3]" style={sans}>
              <span className="truncate">
                Replying to {displayName(replyTo.profile, replyTo.authorId)}
              </span>
              <button type="button" onClick={() => setReplyTo(null)} className="uppercase tracking-[0.12em]">
                Cancel
              </button>
            </div>
          ) : null}
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, MAX_COMMENT))}
            placeholder={replyTo ? 'Write a reply' : 'Write a comment'}
            rows={3}
            maxLength={MAX_COMMENT}
            className="w-full resize-none rounded-2xl bg-[#1E1B1F] px-4 py-3 text-[14px] text-white outline-none placeholder:text-[#6B6870]"
            style={sans}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[12px] text-[#6B6870]" style={sans}>{draft.length}/{MAX_COMMENT}</span>
            <button
              type="submit"
              disabled={submitting || !draft.trim()}
              className="rounded-full bg-[#F5F5F5] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141115] disabled:opacity-40"
              style={sans}
            >
              {submitting ? 'Posting…' : 'Reply'}
            </button>
          </div>
          {commentError ? <StatusMessage tone="error">{commentError}</StatusMessage> : null}
        </form>
      </div>
    </div>
  )
}

function CommentRow({
  comment,
  pendingIds,
  onLike,
  onReply,
  nested = false,
}: {
  comment: EnrichedComment
  pendingIds: Record<string, boolean>
  onLike: (comment: EnrichedComment) => void
  onReply: (comment: EnrichedComment) => void
  nested?: boolean
}) {
  const body = readPostBody(comment)
  const name = displayName(comment.profile, comment.authorId)
  return (
    <div className={nested ? 'mt-3 border-l border-[#3A373C] pl-3' : 'border-b border-[#3A373C] py-3'}>
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
          {body.text ? <p className="mt-1 whitespace-pre-wrap text-[14px] text-white" style={sans}>{body.text}</p> : null}
          {body.workout ? <div className="mt-2"><WorkoutAttachmentCard workout={body.workout} /></div> : null}
          {body.meal ? <div className="mt-2"><MealPostCard meal={body.meal} /></div> : null}
          {body.images.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {body.images.map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={image} src={image} alt="" className="aspect-square rounded-lg object-cover" />
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center gap-4">
            <button
              type="button"
              onClick={() => onLike(comment)}
              disabled={pendingIds[comment.id]}
              aria-label={comment.likedByMe ? 'Unlike reply' : 'Like reply'}
              className="inline-flex items-center gap-1 text-[12px] text-[#A09EA3]"
              style={sans}
            >
              <Heart size={14} fill={comment.likedByMe ? '#FF4D4D' : 'none'} color={comment.likedByMe ? '#FF4D4D' : '#A09EA3'} />
              {comment.likeCount > 0 ? comment.likeCount : null}
            </button>
            <button type="button" onClick={() => onReply(comment)} className="text-[12px] uppercase tracking-[0.12em] text-[#A09EA3]" style={sans}>
              Reply{comment.replyCount > 0 ? ` ${comment.replyCount}` : ''}
            </button>
          </div>
          {comment.replies?.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              pendingIds={pendingIds}
              onLike={onLike}
              onReply={onReply}
              nested
            />
          ))}
        </div>
      </div>
    </div>
  )
}
