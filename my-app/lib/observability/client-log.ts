import { pseudonymousUserRef } from './context'

const META_KEYS = new Set(['stage', 'mime', 'bytes', 'duration_ms'])
const MAX_KEYS = 8
const MAX_STRING = 64

export type AvatarLogEntry = {
  user_ref: string
  event: string
  reason?: string
  stage?: string
  mime?: string
  bytes?: number
  duration_ms?: number
}

/**
 * Client metadata is allowlisted and applied first. Server-owned identity and
 * event fields are written afterwards so a client payload cannot overwrite them.
 */
export function buildAvatarLogEntry(input: {
  userId: string
  event: string
  reason?: string
  meta?: Record<string, unknown>
}): AvatarLogEntry {
  const entry: AvatarLogEntry = {
    user_ref: pseudonymousUserRef(input.userId),
    event: input.event,
  }

  const meta = input.meta ?? {}
  for (const key of Object.keys(meta).slice(0, MAX_KEYS)) {
    if (!META_KEYS.has(key)) continue
    const value = meta[key]
    if (typeof value === 'string') {
      if (key === 'stage' || key === 'mime') entry[key] = value.slice(0, MAX_STRING)
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      if (key === 'bytes' || key === 'duration_ms') entry[key] = value
    }
  }

  if (input.reason) entry.reason = input.reason.slice(0, 200)
  entry.user_ref = pseudonymousUserRef(input.userId)
  entry.event = input.event
  return entry
}
