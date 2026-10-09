import { SpanKind, SpanStatusCode, trace, type Attributes } from '@opentelemetry/api'
import type { ReadableSpan, Span, SpanProcessor } from '@opentelemetry/sdk-trace-base'
import { writeRecord } from './request-log'
import { redactSpan, sanitizeError } from './redact'

export class RedactingSpanProcessor implements SpanProcessor {
  onStart(): void {
    // Attributes are redacted in onEnd, before sibling exporters read them.
  }

  onEnding(span: Span): void {
    redactSpan(span as unknown as { name: string; attributes: Record<string, unknown> })
  }

  onEnd(span: ReadableSpan): void {
    redactSpan(span as unknown as { name: string; attributes: Record<string, unknown> })
  }

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }
}

export async function withDependency<T>(
  name: string,
  attributes: Record<string, string | number | boolean>,
  fn: () => Promise<T>,
  readError?: (result: T) => string | undefined,
): Promise<T> {
  const tracer = trace.getTracer('naturehood-backend')
  return tracer.startActiveSpan(
    name,
    { kind: SpanKind.CLIENT, attributes: attributes as Attributes },
    async (span) => {
      try {
        const result = await fn()
        const errorCode = readError?.(result)
        if (errorCode) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: errorCode })
          span.setAttribute('error.type', errorCode)
          writeRecord({
            event: 'dependency',
            severity: 'error',
            dependency: name,
            outcome: 'error',
            error_type: errorCode,
          })
        } else {
          span.setStatus({ code: SpanStatusCode.OK })
        }
        return result
      } catch (error) {
        const sanitized = sanitizeError(error)
        span.setStatus({ code: SpanStatusCode.ERROR, message: sanitized.error_type })
        span.setAttribute('error.type', sanitized.error_type)
        writeRecord({
          event: 'dependency',
          severity: 'error',
          dependency: name,
          outcome: 'exception',
          ...sanitized,
        })
        throw error
      } finally {
        span.end()
      }
    },
  )
}
