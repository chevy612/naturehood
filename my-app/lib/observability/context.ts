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
  sse?: SseState
}

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

/** Records a server-verified subject on the active request. Raw ids are not stored. */
export function noteVerifiedSubject(userId: string | null | undefined): void {
  if (!userId) return
  const store = storage.getStore()
  if (!store) return
  store.userRef = pseudonymousUserRef(userId)
}
