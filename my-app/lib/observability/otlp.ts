import { logs, SeverityNumber, type AnyValueMap, type LoggerProvider as ILoggerProvider } from '@opentelemetry/api-logs'
import { trace } from '@opentelemetry/api'
import { ExportResultCode, type ExportResult } from '@opentelemetry/core'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
  type LogRecordExporter,
  type ReadableLogRecord,
} from '@opentelemetry/sdk-logs'
import {
  deploymentEnvironment,
  deploymentVersion,
  otlpHeaders,
  otlpLogsEndpoint,
  SERVICE_NAME,
  telemetryDisabled,
} from './config'

const SEVERITY: Record<string, SeverityNumber> = {
  debug: SeverityNumber.DEBUG,
  info: SeverityNumber.INFO,
  warn: SeverityNumber.WARN,
  error: SeverityNumber.ERROR,
}

/** Survives Next.js instrumentation vs route module duplication. */
const PROVIDER_KEY = '__naturehoodLoggerProvider'

type GlobalWithProvider = typeof globalThis & {
  [PROVIDER_KEY]?: LoggerProvider
}

let emitting = false
let flushOverride: (() => Promise<void>) | null = null

class SafeLogExporter implements LogRecordExporter {
  constructor(private readonly inner: LogRecordExporter) {}

  export(records: ReadableLogRecord[], resultCallback: (result: ExportResult) => void): void {
    try {
      this.inner.export(records, (result) => {
        try {
          resultCallback(result)
        } catch {
          // exporter callbacks must not escape into the request
        }
      })
    } catch {
      resultCallback({ code: ExportResultCode.FAILED })
    }
  }

  shutdown(): Promise<void> {
    return this.inner.shutdown().catch(() => undefined)
  }

  forceFlush(): Promise<void> {
    return this.inner.forceFlush().catch(() => undefined)
  }
}

function getProvider(): LoggerProvider | null {
  return (globalThis as GlobalWithProvider)[PROVIDER_KEY] ?? null
}

function setProvider(provider: LoggerProvider): void {
  ;(globalThis as GlobalWithProvider)[PROVIDER_KEY] = provider
}

export function initLogExporter(): void {
  if (telemetryDisabled()) return
  if (getProvider()) return

  const url = otlpLogsEndpoint()
  if (!url) return

  const exporter = new SafeLogExporter(
    new OTLPLogExporter({
      url,
      headers: otlpHeaders(),
      timeoutMillis: 5000,
    }),
  )

  // Simple processor starts the HTTP export on each emit. Batch timers are a
  // poor fit for Vercel Hobby freezes even when after()/waitUntil is used.
  const provider = new LoggerProvider({
    resource: resourceFromAttributes({
      'service.name': SERVICE_NAME,
      'service.version': deploymentVersion(),
      'deployment.environment.name': deploymentEnvironment(),
      environment: deploymentEnvironment(),
    }),
    processors: [new SimpleLogRecordProcessor({ exporter })],
    // Request logs are emitted even when the trace sampler drops the span.
    loggerConfigurator: () => ({
      disabled: false,
      minimumSeverity: SeverityNumber.UNSPECIFIED,
      traceBased: false,
    }),
  })

  setProvider(provider)
  // Best-effort global registration. Emit/flush use globalThis so they still
  // work if another package already claimed the API singleton.
  logs.setGlobalLoggerProvider(provider as unknown as ILoggerProvider)
}

export function emitOtlpLog(record: Record<string, unknown>): void {
  if (emitting) return
  const provider = getProvider()
  if (!provider) return

  emitting = true
  try {
    const severity = typeof record.severity === 'string' ? record.severity : 'info'
    provider.getLogger(SERVICE_NAME).emit({
      severityNumber: SEVERITY[severity] ?? SeverityNumber.INFO,
      severityText: severity.toUpperCase(),
      body: JSON.stringify(record),
      eventName: typeof record.event === 'string' ? record.event : 'log',
      attributes: otlpAttributes(record),
    })
  } catch {
    // telemetry must never break the caller
  } finally {
    emitting = false
  }
}

function otlpAttributes(record: Record<string, unknown>): AnyValueMap {
  const attributes: AnyValueMap = {}
  for (const [key, value] of Object.entries(record)) {
    if (value == null) continue
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      attributes[key] = value
    }
  }
  return attributes
}

export function setTelemetryFlushOverrideForTests(fn: (() => Promise<void>) | null): void {
  flushOverride = fn
}

export async function flushTelemetry(): Promise<void> {
  try {
    if (flushOverride) {
      await flushOverride()
      return
    }
    await Promise.all([
      getProvider()?.forceFlush().catch(() => undefined),
      flushTraces(),
    ])
  } catch {
    // collector outages and hard failures stay best-effort
  }
}

async function flushTraces(): Promise<void> {
  const provider = trace.getTracerProvider() as {
    getDelegate?: () => { forceFlush?: () => Promise<void> }
    forceFlush?: () => Promise<void>
  }
  const delegate = provider.getDelegate?.() ?? provider
  if (typeof delegate.forceFlush === 'function') {
    await delegate.forceFlush().catch(() => undefined)
  }
}
