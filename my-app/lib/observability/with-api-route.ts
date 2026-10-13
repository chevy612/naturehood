import { context, propagation, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api'
import type { NextRequest } from 'next/server'
import { SERVICE_NAME } from './config'
import { applyCorrelationHeaders } from './cors'
import { runWithRequestContext } from './context'
import { scheduleTelemetryFlush } from './flush'
import { writeRecord } from './request-log'
import { sanitizeError } from './redact'
import { beginSseConnection } from './sse'
import { parseTraceparent } from './traceparent'

type RouteHandler<C> = (request: NextRequest, context: C) => Promise<Response> | Response

export type ApiRouteOptions = {
  sse?: boolean
}

function frameworkOutcome(error: unknown): 'redirect' | 'framework' | null {
  if (typeof error !== 'object' || error === null || !('digest' in error)) return null
  const digest = String((error as { digest: unknown }).digest)
  if (digest.startsWith('NEXT_REDIRECT')) return 'redirect'
  if (digest.startsWith('NEXT_')) return 'framework'
  return null
}

function severityForStatus(status: number): 'info' | 'warn' | 'error' {
  if (status >= 500) return 'error'
  if (status >= 400) return 'warn'
  return 'info'
}

export function observeApiRoute<C>(
  route: string,
  method: string,
  handler: RouteHandler<C>,
  options?: ApiRouteOptions,
): RouteHandler<C> {
  return async (request, routeContext) => {
    const requestId = crypto.randomUUID()
    const startedAt = Date.now()
    const parsed = parseTraceparent(
      request.headers.get('traceparent'),
      request.headers.get('tracestate'),
    )
    const carrier: Record<string, string> = {}
    if (parsed) {
      carrier.traceparent = parsed.traceparent
      if (parsed.tracestate) carrier.tracestate = parsed.tracestate
    }
    const parent = propagation.extract(context.active(), carrier)

    return runWithRequestContext(
      { requestId, route, method, startedAt },
      () =>
        context.with(parent, async () => {
          const tracer = trace.getTracer(SERVICE_NAME)
          return tracer.startActiveSpan(
            `${method} ${route}`,
            {
              kind: SpanKind.SERVER,
              attributes: {
                'http.method': method,
                'http.route': route,
                request_id: requestId,
                'traceparent.accepted': Boolean(parsed),
              },
            },
            async (span) => {
              try {
                const response = await handler(request, routeContext)
                applyCorrelationHeaders(response, requestId)
                const status = response.status
                span.setAttribute('http.status_code', status)
                const streaming =
                  Boolean(options?.sse) &&
                  status < 400 &&
                  (response.headers.get('content-type') ?? '').includes('text/event-stream')
                if (streaming) beginSseConnection(request.signal)
                writeRecord({
                  event: 'http.request',
                  severity: severityForStatus(status),
                  http_method: method,
                  http_route: route,
                  http_status: status,
                  duration_ms: Date.now() - startedAt,
                  outcome: streaming ? 'stream_open' : 'complete',
                })
                if (status >= 500) span.setStatus({ code: SpanStatusCode.ERROR })
                else span.setStatus({ code: SpanStatusCode.OK })
                return response
              } catch (error) {
                const framework = frameworkOutcome(error)
                if (framework) {
                  span.setAttribute('next.outcome', framework)
                  span.setStatus({ code: SpanStatusCode.OK })
                  writeRecord({
                    event: 'http.request',
                    severity: 'info',
                    http_method: method,
                    http_route: route,
                    duration_ms: Date.now() - startedAt,
                    outcome: framework,
                  })
                  throw error
                }
                const sanitized = sanitizeError(error)
                span.setStatus({ code: SpanStatusCode.ERROR, message: sanitized.error_type })
                span.setAttribute('error.type', sanitized.error_type)
                writeRecord({
                  event: 'http.request',
                  severity: 'error',
                  http_method: method,
                  http_route: route,
                  duration_ms: Date.now() - startedAt,
                  outcome: 'exception',
                  ...sanitized,
                })
                throw error
              } finally {
                span.end()
                scheduleTelemetryFlush()
              }
            },
          )
        }),
    )
  }
}

export function observeApiRoutes<H extends object>(
  route: string,
  handlers: H,
  options?: ApiRouteOptions,
): H {
  const wrapped = {} as H
  for (const [method, handler] of Object.entries(handlers as Record<string, RouteHandler<unknown>>)) {
    ;(wrapped as Record<string, unknown>)[method] = observeApiRoute(
      route,
      method,
      handler as RouteHandler<unknown>,
      options,
    )
  }
  return wrapped
}
