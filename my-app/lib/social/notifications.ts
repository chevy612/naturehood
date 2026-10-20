export const NOTIFICATION_PAGE_SIZE = 20

export const SHARE_NOTIFICATION_TYPES = ['share_invite', 'share_accepted', 'share_declined'] as const

/** Team Message tab: pending share invitations. */
export const TEAM_MESSAGE_INVITATIONS_ROUTE = '/my-team/message#invitations'

/** Coach inbox: pending tracking invites and athletes you follow. */
export const TEAM_TRACKING_ROUTE = '/my-team/tracking#team-invites'

/** Athlete inbox: coaches you share with and invite outcomes. */
export const TEAM_SHARING_ROUTE = '/my-team/sharing'

export type NotificationDto = {
  id: string
  actorUserId: string
  // Typed as string so a type added by a later migration still renders.
  type: string
  postId: string | null
  commentId: string | null
  logCommentId: string | null
  logType: 'workout' | 'meal' | null
  logId: string | null
  athleteId: string | null
  createdAt: string
  readAt: string | null
}

export type NotificationRow = {
  id: string
  actor_user_id: string
  type: string
  post_id: string | null
  comment_id: string | null
  log_comment_id?: string | null
  log_type?: 'workout' | 'meal' | null
  log_id?: string | null
  athlete_id?: string | null
  created_at: string
  read_at: string | null
}

export function toNotificationDto(row: NotificationRow): NotificationDto {
  const logType = row.log_type === 'workout' || row.log_type === 'meal' ? row.log_type : null
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    type: row.type,
    postId: row.post_id,
    commentId: row.comment_id,
    logCommentId: row.log_comment_id ?? null,
    logType,
    logId: row.log_id ?? null,
    athleteId: row.athlete_id ?? null,
    createdAt: row.created_at,
    readAt: row.read_at,
  }
}

export function isShareNotification(type: string) {
  return (SHARE_NOTIFICATION_TYPES as readonly string[]).includes(type)
}

export function notificationText(type: string) {
  switch (type) {
    case 'like': return 'liked your post'
    case 'comment': return 'commented on your post'
    case 'reply': return 'replied to your comment'
    case 'follow': return 'started following you'
    case 'share_invite': return 'invited you to view their records'
    case 'share_accepted': return 'accepted your record sharing invitation'
    case 'share_declined': return 'declined your record sharing invitation'
    case 'log_comment': return 'commented on your log'
    case 'log_reply': return 'replied to your comment'
    case 'log_comment_like': return 'liked a comment'
    default: return 'sent you a notification'
  }
}

export function notificationHref(
  notification: Pick<NotificationDto, 'type' | 'postId' | 'actorUserId'> & Partial<Pick<NotificationDto, 'logType' | 'logId' | 'athleteId'>>,
) {
  switch (notification.type) {
    case 'like':
    case 'comment':
    case 'reply':
      return notification.postId ? `/home/post/${notification.postId}` : null
    case 'follow':
      return `/home/profile/${notification.actorUserId}`
    case 'log_comment':
    case 'log_reply':
    case 'log_comment_like':
      if (notification.logType && notification.logId && notification.athleteId) {
        return `/my-team/athletes/${notification.athleteId}/logs/${notification.logType}/${notification.logId}?tab=comments`
      }
      return null
    case 'share_invite':
      return TEAM_MESSAGE_INVITATIONS_ROUTE
    case 'share_accepted':
    case 'share_declined':
      return TEAM_SHARING_ROUTE
    default:
      return null
  }
}

function time(notification: NotificationDto) {
  return Date.parse(notification.createdAt)
}

export function sortNotifications(items: NotificationDto[]) {
  return [...items].sort((a, b) => time(b) - time(a) || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0))
}

/**
 * Folds a freshly fetched first page into the list already on screen: the page
 * is the source of truth for its own time range, rows older than it (pages the
 * user already loaded) stay, and rows newer than it (delivered live while the
 * request was in flight) stay.
 */
export function mergeFirstPage(existing: NotificationDto[], page: NotificationDto[], pageFull: boolean) {
  if (page.length === 0) return []
  const pageIds = new Set(page.map((item) => item.id))
  const times = page.map(time)
  const newest = Math.max(...times)
  const oldest = Math.min(...times)
  const kept = existing.filter((item) => {
    if (pageIds.has(item.id)) return false
    const t = time(item)
    return t > newest || (pageFull && t < oldest)
  })
  return sortNotifications([...page, ...kept])
}

export type NotificationsState = {
  items: NotificationDto[]
  unreadCount: number
  hasMore: boolean
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  // Ids flipped to read by an in-flight "mark all", so a failure can undo them.
  undoIds: string[]
}

export const initialNotificationsState: NotificationsState = {
  items: [],
  unreadCount: 0,
  hasMore: false,
  status: 'idle',
  error: null,
  undoIds: [],
}

export type NotificationsAction =
  | { type: 'count_loaded'; count: number }
  | { type: 'refresh_started' }
  | { type: 'refresh_failed'; message: string }
  | { type: 'first_page_loaded'; page: NotificationDto[]; pageFull: boolean }
  | { type: 'next_page_loaded'; page: NotificationDto[]; pageFull: boolean }
  | { type: 'inserted'; notification: NotificationDto }
  | { type: 'updated'; notification: NotificationDto }
  | { type: 'read_started'; id: string; at: string }
  | { type: 'read_failed'; id: string }
  | { type: 'read_all_started'; at: string }
  | { type: 'read_all_failed' }
  | { type: 'read_all_done' }

export function notificationsReducer(state: NotificationsState, action: NotificationsAction): NotificationsState {
  switch (action.type) {
    case 'count_loaded':
      return { ...state, unreadCount: action.count }

    case 'refresh_started':
      return state.status === 'ready' ? state : { ...state, status: 'loading', error: null }

    case 'refresh_failed':
      return state.status === 'ready' ? state : { ...state, status: 'error', error: action.message }

    case 'first_page_loaded': {
      const items = mergeFirstPage(state.items, action.page, action.pageFull)
      const lastIsFromPage = items.length === 0 || action.page.some((item) => item.id === items[items.length - 1].id)
      return {
        ...state,
        items,
        hasMore: lastIsFromPage ? action.pageFull : state.hasMore,
        status: 'ready',
        error: null,
      }
    }

    case 'next_page_loaded': {
      const known = new Set(state.items.map((item) => item.id))
      const fresh = action.page.filter((item) => !known.has(item.id))
      return { ...state, items: sortNotifications([...state.items, ...fresh]), hasMore: action.pageFull }
    }

    case 'inserted': {
      if (state.items.some((item) => item.id === action.notification.id)) return state
      return {
        ...state,
        items: sortNotifications([action.notification, ...state.items]),
        unreadCount: state.unreadCount + (action.notification.readAt === null ? 1 : 0),
      }
    }

    case 'updated': {
      const known = state.items.find((item) => item.id === action.notification.id)
      if (!known || known.readAt === action.notification.readAt) return state
      const delta = known.readAt === null ? -1 : action.notification.readAt === null ? 1 : 0
      return {
        ...state,
        items: state.items.map((item) => item.id === known.id ? { ...item, readAt: action.notification.readAt } : item),
        unreadCount: Math.max(0, state.unreadCount + delta),
      }
    }

    case 'read_started': {
      const known = state.items.find((item) => item.id === action.id)
      if (!known || known.readAt !== null) return state
      return {
        ...state,
        items: state.items.map((item) => item.id === action.id ? { ...item, readAt: action.at } : item),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    }

    case 'read_failed': {
      const known = state.items.find((item) => item.id === action.id)
      if (!known || known.readAt === null) return state
      return {
        ...state,
        items: state.items.map((item) => item.id === action.id ? { ...item, readAt: null } : item),
        unreadCount: state.unreadCount + 1,
      }
    }

    case 'read_all_started': {
      const undoIds = state.items.filter((item) => item.readAt === null).map((item) => item.id)
      return {
        ...state,
        items: state.items.map((item) => item.readAt === null ? { ...item, readAt: action.at } : item),
        unreadCount: 0,
        undoIds,
      }
    }

    case 'read_all_failed': {
      const undo = new Set(state.undoIds)
      return {
        ...state,
        items: state.items.map((item) => undo.has(item.id) ? { ...item, readAt: null } : item),
        unreadCount: state.unreadCount + state.undoIds.length,
        undoIds: [],
      }
    }

    case 'read_all_done':
      return { ...state, undoIds: [] }
  }
}
