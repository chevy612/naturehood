import { trace } from '@opentelemetry/api'
import { deploymentEnvironment, deploymentVersion } from './config'
import { getRequestContext } from './context'
import { emitOtlpLog } from './otlp'
import { sanitizeValue } from './redact'

export type Severity = 'debug' | 'info' | 'warn' | 'error'

export function writeRecord(
  partial: Record<string, unknown> & { severity: Severity; event: string },
): void {
  const context = getRequestContext()
  const spanContext = trace.getActiveSpan()?.spanContext()
  const valid = spanContext && trace.isSpanContextValid(spanContext)
  const record = sanitizeValue({
    ...partial,
    timestamp: new Date().toISOString(),
    environment: deploymentEnvironment(),
    deployment_version: deploymentVersion(),
    request_id: context?.requestId ?? partial.request_id,
    user_ref: context?.userRef ?? partial.user_ref,
    trace_id: valid ? spanContext.traceId : partial.trace_id,
    span_id: valid ? spanContext.spanId : partial.span_id,
  }) as Record<string, unknown>

  const line = JSON.stringify(record)
  if (partial.severity === 'error') console.error(line)
  else if (partial.severity === 'warn') console.warn(line)
  else if (partial.severity === 'debug') console.debug(line)
  else console.info(line)

  emitOtlpLog(record)
}
