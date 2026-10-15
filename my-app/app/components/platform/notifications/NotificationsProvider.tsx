'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { fetchProfiles, type FeedProfile } from '@/lib/social/browser'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/social/notifications-browser'
import {
  initialNotificationsState,
  NOTIFICATION_PAGE_SIZE,
  notificationsReducer,
  type NotificationDto,
} from '@/lib/social/notifications'
import { subscribeToSocialNotifications } from '@/lib/social/realtime'

type NotificationsContextValue = {
  items: NotificationDto[]
  profiles: Record<string, FeedProfile>
  unreadCount: number
  hasMore: boolean
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  actionError: string | null
  loadingMore: boolean
  markingAll: boolean
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
  markRead: (id: string) => void
  markAllRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function useNotifications() {
  const value = useContext(NotificationsContext)
  if (!value) throw new Error('useNotifications must be used inside NotificationsProvider')
  return value
}

function messageOf(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

const FOCUS_SYNC_MIN_INTERVAL_MS = 2000
const COUNT_RESYNC_DEBOUNCE_MS = 400

export function NotificationsProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationsReducer, initialNotificationsState)
  const [profiles, setProfiles] = useState<Record<string, FeedProfile>>({})
  const [actionError, setActionError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const listLoaded = useRef(false)
  const lastSyncAt = useRef(0)
  const requestedProfiles = useRef(new Set<string>())

  const refreshCount = useCallback(async () => {
    try {
      dispatch({ type: 'count_loaded', count: await fetchUnreadCount() })
    } catch {
      // The badge keeps its last known value; the next focus or event retries.
    }
  }, [])

  const refresh = useCallback(async () => {
    lastSyncAt.current = Date.now()
    dispatch({ type: 'refresh_started' })
    try {
      const [page, count] = await Promise.all([fetchNotifications(), fetchUnreadCount()])
      listLoaded.current = true
      dispatch({ type: 'first_page_loaded', page, pageFull: page.length >= NOTIFICATION_PAGE_SIZE })
      dispatch({ type: 'count_loaded', count })
    } catch (error) {
      dispatch({ type: 'refresh_failed', message: messageOf(error, 'Could not load notifications.') })
    }
  }, [])

  const sync = useCallback(() => {
    lastSyncAt.current = Date.now()
    if (listLoaded.current) void refresh()
    else void refreshCount()
  }, [refresh, refreshCount])

  const loadMore = useCallback(async () => {
    const last = state.items[state.items.length - 1]
    if (!last || !state.hasMore || loadingMore) return
    setLoadingMore(true)
    setActionError(null)
    try {
      const page = await fetchNotifications(last.createdAt)
      dispatch({ type: 'next_page_loaded', page, pageFull: page.length >= NOTIFICATION_PAGE_SIZE })
    } catch (error) {
      setActionError(messageOf(error, 'Could not load more notifications.'))
    } finally {
      setLoadingMore(false)
    }
  }, [state.items, state.hasMore, loadingMore])

  const markRead = useCallback((id: string) => {
    const target = state.items.find((item) => item.id === id)
    if (!target || target.readAt !== null) return
    setActionError(null)
    dispatch({ type: 'read_started', id, at: new Date().toISOString() })
    markNotificationRead(id).catch((error) => {
      dispatch({ type: 'read_failed', id })
      setActionError(messageOf(error, 'Could not mark this notification as read.'))
      void refreshCount()
    })
  }, [state.items, refreshCount])

  const markAllRead = useCallback(async () => {
    if (markingAll) return
    setMarkingAll(true)
    setActionError(null)
    dispatch({ type: 'read_all_started', at: new Date().toISOString() })
    try {
      await markAllNotificationsRead()
      dispatch({ type: 'read_all_done' })
    } catch (error) {
      dispatch({ type: 'read_all_failed' })
      setActionError(messageOf(error, 'Could not mark notifications as read.'))
      void refreshCount()
    } finally {
      setMarkingAll(false)
    }
  }, [markingAll, refreshCount])

  useEffect(() => {
    void refreshCount()
  }, [refreshCount])

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false
    let channel: RealtimeChannel | null = null
    let countTimer: ReturnType<typeof setTimeout> | undefined
    let subscribedBefore = false

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      // RLS decides which rows the socket may deliver, so it needs the user's JWT.
      if (data.session) supabase.realtime.setAuth(data.session.access_token)
      channel = subscribeToSocialNotifications(userId, {
        onInsert: (notification) => dispatch({ type: 'inserted', notification }),
        onUpdate: (notification) => {
          dispatch({ type: 'updated', notification })
          // Other tabs mark rows read; the server count is the source of truth.
          clearTimeout(countTimer)
          countTimer = setTimeout(() => void refreshCount(), COUNT_RESYNC_DEBOUNCE_MS)
        },
        onSubscribed: () => {
          // A re-subscribe means the socket was down; catch up on anything missed.
          if (subscribedBefore) sync()
          subscribedBefore = true
        },
      })
    })

    return () => {
      cancelled = true
      clearTimeout(countTimer)
      if (channel) void supabase.removeChannel(channel)
    }
  }, [userId, refreshCount, sync])

  useEffect(() => {
    function onFocus() {
      if (document.visibilityState === 'hidden') return
      if (Date.now() - lastSyncAt.current < FOCUS_SYNC_MIN_INTERVAL_MS) return
      sync()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [sync])

  useEffect(() => {
    const missing = [...new Set(state.items.map((item) => item.actorUserId))]
      .filter((id) => !requestedProfiles.current.has(id))
    if (missing.length === 0) return
    missing.forEach((id) => requestedProfiles.current.add(id))
    fetchProfiles(missing)
      .then((found) => setProfiles((current) => ({ ...current, ...found })))
      .catch(() => missing.forEach((id) => requestedProfiles.current.delete(id)))
  }, [state.items])

  const value = useMemo<NotificationsContextValue>(() => ({
    items: state.items,
    profiles,
    unreadCount: state.unreadCount,
    hasMore: state.hasMore,
    status: state.status,
    error: state.error,
    actionError,
    loadingMore,
    markingAll,
    refresh,
    loadMore,
    markRead,
    markAllRead,
  }), [state, profiles, actionError, loadingMore, markingAll, refresh, loadMore, markRead, markAllRead])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}
