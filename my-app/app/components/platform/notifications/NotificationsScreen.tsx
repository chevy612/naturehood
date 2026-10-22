'use client'

import { useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { LogoSpinner } from '@/app/components/ui/logo-spinner'
import { NotificationItem } from '@/app/components/platform/notifications/NotificationItem'
import { useNotifications } from '@/app/components/platform/notifications/NotificationsProvider'
import { LoadMoreButton, StatusMessage } from '@/app/components/platform/social/StatusMessage'
import { sans, display } from '@/lib/social/format'

export function NotificationsScreen() {
  const {
    items,
    profiles,
    unreadCount,
    hasMore,
    status,
    error,
    actionError,
    loadingMore,
    markingAll,
    refresh,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications()

  useEffect(() => {
    void refresh()
  }, [refresh])

  const showSpinner = status === 'idle' || status === 'loading'

  return (
    <div className="min-h-screen bg-[#141115] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1
            className="flex items-center gap-2 text-2xl font-bold text-white"
            style={{ ...display, letterSpacing: '-0.02em' }}
          >
            Notifications
            {unreadCount > 0 ? (
              <span className="rounded-full bg-[#F5F5F5] px-2 py-0.5 text-[10px] font-bold tracking-normal text-[#141115]">
                {unreadCount > 99 ? '99+' : unreadCount} new
              </span>
            ) : null}
          </h1>
          <button
            type="button"
            onClick={() => void markAllRead()}
            disabled={unreadCount === 0 || markingAll}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A09EA3] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#A09EA3]"
            style={sans}
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        </div>

        {actionError ? (
          <p
            role="alert"
            className="mb-4 border border-[#FF4D4D]/40 px-3 py-2 text-[13px] text-[#FF4D4D]"
            style={sans}
          >
            {actionError}
          </p>
        ) : null}

        {showSpinner ? (
          <div className="flex justify-center py-20">
            <LogoSpinner size={64} />
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="flex flex-col items-center">
            <StatusMessage tone="error">{error ?? 'Could not load notifications.'}</StatusMessage>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-full bg-[#F5F5F5] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141115]"
              style={sans}
            >
              Try again
            </button>
          </div>
        ) : null}

        {status === 'ready' && items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#3A373C] text-[#6B6870]">
              <Bell size={22} />
            </span>
            <p className="text-[16px] text-white" style={sans}>You&rsquo;re all caught up</p>
            <p className="mt-2 max-w-xs text-[13px] leading-[19px] text-[#6B6870]" style={sans}>
              Likes, comments, replies, new followers and record sharing invitations will show up here.
            </p>
          </div>
        ) : null}

        {status === 'ready' && items.length > 0 ? (
          <ul className="border-t border-[#2A272C]">
            {items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                profile={profiles[notification.actorUserId] ?? null}
                onOpen={() => markRead(notification.id)}
              />
            ))}
          </ul>
        ) : null}

        {status === 'ready' && hasMore ? (
          <LoadMoreButton loading={loadingMore} onClick={() => void loadMore()} />
        ) : null}
      </div>
    </div>
  )
}
