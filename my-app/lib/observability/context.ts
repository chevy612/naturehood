import { createHash, createHmac } from 'crypto'
import { AsyncLocalStorage } from 'async_hooks'

export type SseState = {
  openedAt: number
  closed: boolean
  flushes: number
  timer?: ReturnType<typeof setInterval>
}

export type RequestContext = {
  requestId: string
  route: string
  method: string
  startedAt: number
  userRef?: string
  /** Public profile username from a server-side profiles lookup. Not client-supplied. */
  username?: string
  sse?: SseState
}

/** Profile usernames are lowercase alphanumerics plus . _ - */
const USERNAME_RE = /^[a-z0-9._-]{1,64}$/

const storage = new AsyncLocalStorage<RequestContext>()

export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn)
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore()
}

export function pseudonymousUserRef(userId: string): string {
  const secret = process.env.NATUREHOOD_USER_REF_SECRET
  const digest = secret
    ? createHmac('sha256', secret).update(userId).digest('hex')
    : createHash('sha256').update(`naturehood-user:${userId}`).digest('hex')
  return digest.slice(0, 16)
}

export function normalizeLogUsername(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined
  const value = raw.trim().toLowerCase().slice(0, 64)
  if (!USERNAME_RE.test(value)) return undefined
  if (value.includes('@')) return undefined
  return value
}

/**
 * Records a server-verified subject on the active request.
 * Raw user ids are hashed to user_ref. Username is optional and must come from
 * a server lookup (profiles), never from client metadata.
 */
export function noteVerifiedSubject(
  userId: string | null | undefined,
  username?: string | null,
): void {
  if (!userId) return
  const store = storage.getStore()
  if (!store) return
  store.userRef = pseudonymousUserRef(userId)
  const cleaned = normalizeLogUsername(username)
  if (cleaned) store.username = cleaned
}
