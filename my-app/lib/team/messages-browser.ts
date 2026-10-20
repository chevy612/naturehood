'use client'

import { createClient } from '@/lib/supabase/client'
import { toNotificationDto, type NotificationDto, type NotificationRow } from '@/lib/social/notifications'
import { isModeNotification, modeNotificationTypes } from '@/lib/team/messages'
import type { TeamMode } from '@/lib/team/mode'

const PAGE_SIZE = 30

export async function fetchModeNotifications(mode: TeamMode, userId: string, before?: string | null): Promise<NotificationDto[]> {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return []
  let query = createClient()
    .from('social_notifications')
    .select('id, actor_user_id, type, post_id, comment_id, log_comment_id, log_type, log_id, athlete_id, created_at, read_at')
    .eq('recipient_user_id', userId)
    .in('type', modeNotificationTypes(mode))
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE)
  if (mode === 'athlete') query = query.eq('athlete_id', userId)
  if (mode === 'coach') query = query.or(`type.eq.share_invite,athlete_id.neq.${userId}`)
  if (before) query = query.lt('created_at', before)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return ((data ?? []) as NotificationRow[])
    .map((row) => toNotificationDto(row))
    .filter((item) => isModeNotification(item, mode, userId))
}
