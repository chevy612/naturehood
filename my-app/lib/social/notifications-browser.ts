'use client'

import { socialFetch } from '@/lib/social/browser'
import { NOTIFICATION_PAGE_SIZE, type NotificationDto } from '@/lib/social/notifications'

export async function fetchNotifications(before?: string | null): Promise<NotificationDto[]> {
  const params = new URLSearchParams({ limit: String(NOTIFICATION_PAGE_SIZE) })
  if (before) params.set('before', before)
  return socialFetch<NotificationDto[]>(`/api/notifications?${params}`)
}

export async function fetchUnreadCount(): Promise<number> {
  const result = await socialFetch<{ count: number }>('/api/notifications/unread-count')
  return result.count
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await socialFetch<null>(`/api/notifications/${notificationId}/read`, { method: 'PUT' })
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  return socialFetch<{ updated: number }>('/api/notifications/read-all', { method: 'PUT' })
}
