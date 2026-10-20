'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { NotificationItem } from '@/app/components/platform/notifications/NotificationItem'
import { InviteCoach, ShareLinkPanel } from '@/app/components/platform/team/SharingTab'
import { TeamLoading } from '@/app/components/platform/team/shared'
import { useTeamMode } from '@/app/components/platform/team/TeamModeProvider'
import { fetchProfiles, type FeedProfile } from '@/lib/social/browser'
import { sans } from '@/lib/social/format'
import { markNotificationRead } from '@/lib/social/notifications-browser'
import type { NotificationDto } from '@/lib/social/notifications'
import { listMyShares } from '@/lib/team/browser'
import { fetchModeNotifications } from '@/lib/team/messages-browser'
import type { ShareRow } from '@/lib/team/types'

function MessageList({
  items,
  profiles,
  onOpen,
  empty,
  scrollable,
}: {
  items: NotificationDto[]
  profiles: Record<string, FeedProfile>
  onOpen: (id: string) => void
  empty: string
  scrollable: boolean
}) {
  const body = items.length === 0 ? (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#3A373C] text-[#6B6870]">
        <Bell size={18} />
      </span>
      <p className="text-[14px] text-white" style={sans}>You&rsquo;re all caught up</p>
      <p className="mt-2 max-w-xs text-[13px] leading-[19px] text-[#6B6870]" style={sans}>{empty}</p>
    </div>
  ) : (
    <ul className="border-t border-[#2A272C]">
      {items.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          profile={profiles[notification.actorUserId] ?? null}
          onOpen={() => onOpen(notification.id)}
        />
      ))}
    </ul>
  )

  if (!scrollable) return body
  return (
    <div
      className="h-[50vh] min-h-64 overflow-y-auto rounded-2xl border border-[#3A373C]"
      aria-label="Notifications"
      data-testid="coach-notification-scroll"
    >
      {body}
    </div>
  )
}

export function TeamMessage() {
  const { mode, userId } = useTeamMode()
  const [items, setItems] = useState<NotificationDto[]>([])
  const [profiles, setProfiles] = useState<Record<string, FeedProfile>>({})
  const [error, setError] = useState<string | null>(null)
  const [shares, setShares] = useState<ShareRow[]>([])
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const generation = useRef(0)
  const requestKey = `${mode}:${userId}`
  const loading = loadedKey !== requestKey

  const load = useCallback(async () => {
    const request = ++generation.current
    const [itemResult, shareResult] = await Promise.allSettled([
      fetchModeNotifications(mode, userId),
      mode === 'coach' ? listMyShares('athlete') : Promise.resolve([] as ShareRow[]),
    ])
    if (generation.current !== request) return
    if (itemResult.status === 'fulfilled') {
      setItems(itemResult.value)
      const ids = itemResult.value.map((item) => item.actorUserId)
      let nextProfiles: Record<string, FeedProfile> = {}
      if (ids.length > 0) {
        try {
          nextProfiles = await fetchProfiles(ids)
        } catch {
          nextProfiles = {}
        }
      }
      if (generation.current !== request) return
      setProfiles(nextProfiles)
      setError(null)
    } else {
      setError(itemResult.reason instanceof Error ? itemResult.reason.message : 'Could not load messages.')
    }
    if (generation.current !== request) return
    if (shareResult.status === 'fulfilled') setShares(shareResult.value)
    setLoadedKey(`${mode}:${userId}`)
  }, [mode, userId])

  useEffect(() => {
    // Notifications are fetched from Supabase; state is applied after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch, not a synchronous render cascade
    void load()
  }, [load])

  function handleOpen(id: string) {
    setItems((current) => current.map((item) => item.id === id && item.readAt === null ? { ...item, readAt: new Date().toISOString() } : item))
    void markNotificationRead(id).catch(() => {
      setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: null } : item))
    })
  }

  const empty = mode === 'coach'
    ? 'Invitations and replies on athletes you track will show up here.'
    : 'Comments and likes on your logs will show up here.'

  return (
    <div className="flex flex-col gap-6">
      {loading ? <TeamLoading /> : null}
      {!loading && error ? (
        <p role="alert" className="text-[13px] text-[#FF4D4D]" style={sans}>{error}</p>
      ) : null}
      {!loading && !error ? (
        <MessageList
          items={items}
          profiles={profiles}
          onOpen={handleOpen}
          empty={empty}
          scrollable={mode === 'coach'}
        />
      ) : null}

      {mode === 'coach' ? (
        <div id="invitations" className="flex scroll-mt-6 flex-col gap-6" data-testid="coach-invitations">
          <InviteCoach shares={shares} onInvited={load} />
          <ShareLinkPanel />
        </div>
      ) : null}
    </div>
  )
}
