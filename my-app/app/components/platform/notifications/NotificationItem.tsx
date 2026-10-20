'use client'

import Link from 'next/link'
import { Bell, Check, Heart, MessageCircle, Reply, Share2, UserPlus, X, type LucideIcon } from 'lucide-react'
import { Avatar } from '@/app/components/platform/Avatar'
import { PillTag } from '@/app/components/ui/tags'
import type { FeedProfile } from '@/lib/social/browser'
import { displayName, formatRelativeTime, sans } from '@/lib/social/format'
import {
  isShareNotification,
  notificationHref,
  notificationText,
  type NotificationDto,
} from '@/lib/social/notifications'

const TYPE_ICONS: Record<string, LucideIcon> = {
  like: Heart,
  comment: MessageCircle,
  reply: Reply,
  follow: UserPlus,
  share_invite: Share2,
  share_accepted: Check,
  share_declined: X,
  log_comment: MessageCircle,
  log_reply: Reply,
  log_comment_like: Heart,
}

export function NotificationItem({
  notification,
  profile,
  onOpen,
}: {
  notification: NotificationDto
  profile: FeedProfile | null
  onOpen: () => void
}) {
  const unread = notification.readAt === null
  const name = displayName(profile, notification.actorUserId)
  const href = notificationHref(notification)
  const Icon = TYPE_ICONS[notification.type] ?? Bell

  const row = (
    <>
      <div className="relative shrink-0">
        <Avatar name={name} photoUrl={profile?.avatar_url} size="md" />
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#3A373C] bg-[#141115] text-[#F5F5F5]">
          <Icon size={11} strokeWidth={2.2} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] leading-[20px] ${unread ? 'text-[#E8E8E8]' : 'text-[#A09EA3]'}`} style={sans}>
          <span className={`font-semibold ${unread ? 'text-white' : 'text-[#E8E8E8]'}`}>{name}</span>{' '}
          {notificationText(notification.type)}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <time
            dateTime={notification.createdAt}
            title={new Date(notification.createdAt).toLocaleString()}
            className="text-[12px] text-[#6B6870]"
            style={sans}
          >
            {formatRelativeTime(notification.createdAt)}
          </time>
          {isShareNotification(notification.type) ? (
            <PillTag label="Record sharing" variant="ghost-green" size="sm" />
          ) : null}
        </div>
      </div>
      {unread ? (
        <>
          <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[#F5F5F5]" />
          <span className="sr-only">Unread</span>
        </>
      ) : null}
    </>
  )

  const className = `relative flex w-full items-center gap-3 border-b border-[#2A272C] px-4 py-3 text-left transition-colors ${
    unread ? 'bg-[#1E1B1F] hover:bg-[#242025]' : 'bg-transparent hover:bg-[#1A1719]'
  }`

  const unreadBar = unread ? <span aria-hidden className="absolute bottom-0 left-0 top-0 w-[2px] bg-[#F5F5F5]" /> : null

  if (href) {
    return (
      <li>
        <Link href={href} onClick={onOpen} className={className}>
          {unreadBar}
          {row}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <button type="button" onClick={onOpen} className={`${className} cursor-default`}>
        {unreadBar}
        {row}
      </button>
    </li>
  )
}
