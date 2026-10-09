import { trace } from '@opentelemetry/api'
import { flushTelemetry } from './otlp'
import { writeRecord } from './request-log'
import { getRequestContext } from './context'

const FLUSH_INTERVAL_MS = 30_000
const MAX_FLUSHES = 240

type SseSession = {
  openedAt: number
  closed: boolean
  flushes: number
  timer?: ReturnType<typeof setInterval>
  httpMethod?: string
  httpRoute?: string
  requestId?: string
  userRef?: string
  traceId?: string
  spanId?: string
}

const sessions = new WeakMap<AbortSignal, SseSession>()

export function beginSseConnection(signal: AbortSignal): void {
  if (sessions.has(signal)) return
  const context = getRequestContext()
  const spanContext = trace.getActiveSpan()?.spanContext()
  const valid = spanContext && trace.isSpanContextValid(spanContext)
  const session: SseSession = {
    openedAt: Date.now(),
    closed: false,
    flushes: 0,
    httpMethod: context?.method,
    httpRoute: context?.route,
    requestId: context?.requestId,
    userRef: context?.userRef,
    traceId: valid ? spanContext.traceId : undefined,
    spanId: valid ? spanContext.spanId : undefined,
  }
  sessions.set(signal, session)
  writeRecord({
    event: 'sse.open',
    severity: 'info',
    outcome: 'open',
    http_method: session.httpMethod,
    http_route: session.httpRoute,
  })

  const timer = setInterval(() => {
    session.flushes += 1
    if (session.flushes > MAX_FLUSHES) {
      clearInterval(timer)
      return
    }
    void flushTelemetry()
  }, FLUSH_INTERVAL_MS)
  timer.unref?.()
  session.timer = timer
  if (signal.aborted) {
    finishSseConnection(signal, 'abort')
    return
  }
  signal.addEventListener('abort', () => finishSseConnection(signal, 'abort'), { once: true })
}

export function finishSseConnection(
  signal: AbortSignal,
  reason: 'abort' | 'cancel' | 'close' = 'close',
): void {
  const session = sessions.get(signal)
  if (!session || session.closed) return
  session.closed = true
  if (session.timer) clearInterval(session.timer)
  const durationMs = Date.now() - session.openedAt
  const fields = {
    http_method: session.httpMethod,
    http_route: session.httpRoute,
    request_id: session.requestId,
    user_ref: session.userRef,
    trace_id: session.traceId,
    span_id: session.spanId,
    duration_ms: durationMs,
  }
  writeRecord({ event: 'sse.disconnect', severity: 'info', outcome: reason, ...fields })
  writeRecord({ event: 'sse.lifetime', severity: 'info', ...fields })
  void flushTelemetry()
}

const SAFE_CHANNEL_STATUS = /^(CHANNEL_ERROR|TIMED_OUT)$/

export function noteSseSubscriptionError(channelStatus: string, signal?: AbortSignal): void {
  const session = signal ? sessions.get(signal) : undefined
  const status = SAFE_CHANNEL_STATUS.test(channelStatus) ? channelStatus : 'CHANNEL_ERROR'
  writeRecord({
    event: 'sse.subscription_error',
    severity: 'error',
    outcome: 'error',
    error_type: status,
    http_method: session?.httpMethod,
    http_route: session?.httpRoute,
    request_id: session?.requestId,
    user_ref: session?.userRef,
    trace_id: session?.traceId,
    span_id: session?.spanId,
  })
  void flushTelemetry()
}
