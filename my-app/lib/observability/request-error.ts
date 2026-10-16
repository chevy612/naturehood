import { after } from 'next/server'
import { writeRecord } from './request-log'
import { sanitizeError } from './redact'
import { flushTelemetry } from './otlp'

const MARK_KEY = '__naturehoodLoggedErrors'

type MarkStore = WeakSet<object>

function store(): MarkStore {
  const holder = globalThis as Record<string, unknown>
  return (holder[MARK_KEY] ??= new WeakSet<object>()) as MarkStore
}

/** Called by wrappers that already wrote a record, so onRequestError skips it. */
export function markErrorRecorded(error: unknown): void {
  if (error && typeof error === 'object') store().add(error)
}

export type RequestErrorInfo = {
  path: string
  method: string
}

export type RequestErrorRoute = {
  routePath: string
  routeType: string
  routerKind?: string
}

function stripQuery(path: string): string {
  return (path.split('?')[0] ?? path).slice(0, 200)
}

/**
 * Next.js onRequestError handler. Catches failures outside the route and
 * action wrappers: module-load errors, render errors, proxy errors.
 */
export function recordRequestError(
  error: unknown,
  request: RequestErrorInfo,
  routeContext: RequestErrorRoute,
): Promise<void> {
  if (error && typeof error === 'object' && store().has(error)) return Promise.resolve()

  writeRecord({
    event: 'http.unhandled_error',
    severity: 'error',
    http_method: request.method,
    http_route: routeContext.routePath,
    http_path: stripQuery(request.path),
    route_type: routeContext.routeType,
    router_kind: routeContext.routerKind,
    digest: (error as { digest?: unknown } | null)?.digest,
    outcome: 'unhandled_exception',
    ...sanitizeError(error),
  })

  const pending = flushTelemetry()
  try {
    after(() => pending)
  } catch {
    // outside a request scope; the flush still runs
  }
  return pending
}
