import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api'
import { SERVICE_NAME } from './config'
import { runWithRequestContext } from './context'
import { scheduleTelemetryFlush } from './flush'
import { writeRecord } from './request-log'
import { redactString, sanitizeError } from './redact'

function frameworkOutcome(error: unknown): 'redirect' | 'framework' | null {
  if (typeof error !== 'object' || error === null || !('digest' in error)) return null
  const digest = String((error as { digest: unknown }).digest)
  if (digest.startsWith('NEXT_REDIRECT')) return 'redirect'
  if (digest.startsWith('NEXT_')) return 'framework'
  return null
}

function actionFailureMessage(result: unknown): string | undefined {
  if (!result || typeof result !== 'object') return undefined
  const record = result as { error?: unknown; ok?: unknown }
  if (typeof record.error === 'string' && record.error) return record.error
  if (record.ok === false && typeof record.error === 'string') return record.error
  return undefined
}

export async function withServerAction<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const requestId = crypto.randomUUID()
  const startedAt = Date.now()
  return runWithRequestContext(
    { requestId, route: name, method: 'ACTION', startedAt },
    async () => {
      const tracer = trace.getTracer(SERVICE_NAME)
      return tracer.startActiveSpan(
        `server_action ${name}`,
        {
          kind: SpanKind.INTERNAL,
          attributes: { 'server.action': name, request_id: requestId },
        },
        async (span) => {
          try {
            const result = await fn()
            const failure = actionFailureMessage(result)
            if (failure) {
              span.setStatus({ code: SpanStatusCode.ERROR, message: 'action_result' })
              writeRecord({
                event: 'server_action',
                severity: 'warn',
                action: name,
                outcome: 'error',
                duration_ms: Date.now() - startedAt,
                error_type: 'action_result',
                error_message: redactString(failure).slice(0, 300),
              })
            } else {
              span.setStatus({ code: SpanStatusCode.OK })
              writeRecord({
                event: 'server_action',
                severity: 'info',
                action: name,
                outcome: 'ok',
                duration_ms: Date.now() - startedAt,
              })
            }
            return result
          } catch (error) {
            const framework = frameworkOutcome(error)
            if (framework) {
              span.setAttribute('next.outcome', framework)
              span.setStatus({ code: SpanStatusCode.OK })
              writeRecord({
                event: 'server_action',
                severity: 'info',
                action: name,
                outcome: framework,
                duration_ms: Date.now() - startedAt,
              })
              throw error
            }
            const sanitized = sanitizeError(error)
            span.setStatus({ code: SpanStatusCode.ERROR, message: sanitized.error_type })
            span.setAttribute('error.type', sanitized.error_type)
            writeRecord({
              event: 'server_action',
              severity: 'error',
              action: name,
              outcome: 'exception',
              duration_ms: Date.now() - startedAt,
              ...sanitized,
            })
            throw error
          } finally {
            span.end()
            scheduleTelemetryFlush()
          }
        },
      )
    },
  )
}
