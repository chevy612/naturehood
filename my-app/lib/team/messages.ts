import type { NotificationDto } from '@/lib/social/notifications'
import type { TeamMode } from '@/lib/team/mode'

const ATHLETE_TYPES = new Set(['log_comment', 'log_reply', 'log_comment_like'])

/** Athlete mode: comments and likes on the user's own logs. Coach mode: invites plus activity on other athletes' logs. */
export function isModeNotification(item: NotificationDto, mode: TeamMode, userId: string): boolean {
  if (mode === 'athlete') {
    return ATHLETE_TYPES.has(item.type) && item.athleteId === userId
  }
  if (item.type === 'share_invite') return true
  if (item.type === 'log_reply' || item.type === 'log_comment_like') {
    return item.athleteId !== null && item.athleteId !== userId
  }
  return false
}

export function modeNotificationTypes(mode: TeamMode): string[] {
  return mode === 'athlete'
    ? ['log_comment', 'log_reply', 'log_comment_like']
    : ['share_invite', 'log_reply', 'log_comment_like']
}
