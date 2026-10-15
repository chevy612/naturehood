export function formatRelativeTime(dateIso: string) {
  const then = new Date(dateIso).getTime()
  if (Number.isNaN(then)) return ''
  const diffSeconds = Math.max(1, Math.floor((Date.now() - then) / 1000))
  if (diffSeconds < 60) return `${diffSeconds}s`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`
  return `${Math.floor(diffHours / 24)}d`
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function displayName(profile: { name?: string | null; username?: string | null } | null, authorId: string) {
  return profile?.name?.trim() || profile?.username?.trim() || `user_${authorId.slice(0, 6)}`
}

export function profileHref(profile: { username?: string | null } | null, authorId: string) {
  if (profile?.username) return `/${profile.username}`
  return `/home/profile/${authorId}`
}

export function roleLabel(role: string | null | undefined) {
  if (role === 'brand') return 'Brand'
  if (role === 'other') return 'Explorer'
  return 'Athlete'
}

export const sans = { fontFamily: "'DM Sans', sans-serif" } as const
