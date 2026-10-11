import { after } from 'next/server'
import { flushTelemetry } from './otlp'

/**
 * Bounded flush after the response or action. Exporter failures are swallowed.
 * The promise must be returned to `after()` so Vercel waitUntil keeps the
 * isolate alive until OTLP log export finishes. Fire-and-forget void drops logs.
 */
export function scheduleTelemetryFlush(): void {
  try {
    after(() => flushTelemetry())
  } catch {
    void flushTelemetry()
  }
}
