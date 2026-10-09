/**
 * Level-controlled server logger.
 *
 * Set LOG_LEVEL to debug | info | warn | error.
 * Ad-hoc logs below the configured level are suppressed.
 * Structured request, action, and dependency records are emitted separately
 * and are not filtered by LOG_LEVEL.
 *
 * Console lines are JSON for Vercel troubleshooting. The same sanitized
 * record is exported to Loki when OTLP is configured. Passwords, OTPs,
 * cookies, authorization headers, API keys, signed URL queries, bodies,
 * and food/workout content are removed before either sink.
 */

import { deploymentEnvironment, deploymentVersion } from './observability/config'
import { getRequestContext } from './observability/context'
import { emitOtlpLog } from './observability/otlp'
import { sanitizeValue } from './observability/redact'
import { trace } from '@opentelemetry/api'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function currentLevel(): number {
  const raw = (process.env.LOG_LEVEL ?? 'debug').toLowerCase() as LogLevel
  return LEVELS[raw] ?? LEVELS.debug
}

function emit(level: LogLevel, args: unknown[]): void {
  if (LEVELS[level] < currentLevel()) return

  const sanitized = args.map((arg) => sanitizeValue(arg))
  const message = sanitized
    .map((value) => (typeof value === 'string' ? value : JSON.stringify(value)))
    .join(' ')
  const context = getRequestContext()
  const spanContext = trace.getActiveSpan()?.spanContext()
  const valid = spanContext && trace.isSpanContextValid(spanContext)
  const record = {
    timestamp: new Date().toISOString(),
    severity: level,
    environment: deploymentEnvironment(),
    deployment_version: deploymentVersion(),
    event: 'log',
    message,
    request_id: context?.requestId,
    user_ref: context?.userRef,
    trace_id: valid ? spanContext.traceId : undefined,
    span_id: valid ? spanContext.spanId : undefined,
  }

  const line = JSON.stringify(record)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else if (level === 'debug') console.debug(line)
  else console.info(line)

  emitOtlpLog(record)
}

const logger = {
  debug: (...args: unknown[]) => emit('debug', args),
  info: (...args: unknown[]) => emit('info', args),
  warn: (...args: unknown[]) => emit('warn', args),
  error: (...args: unknown[]) => emit('error', args),
}

export default logger
