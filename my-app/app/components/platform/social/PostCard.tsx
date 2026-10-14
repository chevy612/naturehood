'use client'

import Link from 'next/link'
import { Heart, MessageCircle } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { MealPostCard } from '@/app/components/platform/social/MealPostCard'
import { WorkoutAttachmentCard } from '@/app/components/platform/social/WorkoutAttachmentCard'
import { displayName, formatRelativeTime, profileHref, sans } from '@/lib/social/format'
import { isVideoUrl, readPostBody } from '@/lib/social/post-content'
import type { EnrichedPost } from '@/lib/social/browser'

export function PostCard({
  post,
  likePending = false,
  onLike,
  linked = true,
}: {
  post: EnrichedPost
  likePending?: boolean
  onLike: () => void
  linked?: boolean
}) {
  const body = readPostBody(post)
  const name = displayName(post.profile, post.authorId)
  const when = formatRelativeTime(post.createdAt)

  return (
    <article className="border-b border-[#3A373C] py-4">
      <div className="flex items-start gap-3">
        <Link href={profileHref(post.profile, post.authorId)} className="shrink-0">
          <Avatar name={name} photoUrl={post.profile?.avatar_url} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <Link
              href={profileHref(post.profile, post.authorId)}
              className="truncate text-[14px] font-semibold text-white hover:underline"
              style={sans}
            >
              {name}
            </Link>
            <time className="shrink-0 text-[12px] text-[#6B6870]" style={sans} dateTime={post.createdAt}>
              {when}
            </time>
          </div>

          {body.text ? (
            linked ? (
              <Link href={`/home/post/${post.id}`} className="mt-1 block whitespace-pre-wrap text-[15px] leading-6 text-white" style={sans}>
                {body.text}
              </Link>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-[15px] leading-6 text-white" style={sans}>{body.text}</p>
            )
          ) : null}

          <div className="mt-3 flex flex-col gap-3">
            {body.workout ? <WorkoutAttachmentCard workout={body.workout} /> : null}
            {body.meal ? <MealPostCard meal={body.meal} /> : null}
            {body.images.length > 0 && (
              <div className={`grid gap-2 ${body.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {body.images.map((image) => isVideoUrl(image) ? (
                  <video key={image} src={image} controls className="aspect-video w-full rounded-xl bg-black" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={image} src={image} alt="" className="aspect-square w-full rounded-xl object-cover" />
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              onClick={onLike}
              disabled={likePending}
              aria-pressed={post.likedByMe}
              aria-label={post.likedByMe ? 'Unlike post' : 'Like post'}
              className="inline-flex items-center gap-1.5 text-[13px] text-[#A09EA3] disabled:opacity-50"
              style={sans}
            >
              <Heart size={16} fill={post.likedByMe ? '#FF4D4D' : 'none'} color={post.likedByMe ? '#FF4D4D' : '#A09EA3'} />
              {post.likeCount > 0 ? post.likeCount : null}
            </button>
            {linked ? (
              <Link href={`/home/post/${post.id}`} className="inline-flex items-center gap-1.5 text-[13px] text-[#A09EA3]" style={sans} aria-label="Comment on post">
                <MessageCircle size={16} />
                {post.commentCount > 0 ? post.commentCount : null}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-[#A09EA3]" style={sans}>
                <MessageCircle size={16} />
                {post.commentCount > 0 ? post.commentCount : null}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
