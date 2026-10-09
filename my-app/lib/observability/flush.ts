import { after } from 'next/server'
import { flushTelemetry } from './otlp'

/** Bounded flush after the response or action. Exporter failures are swallowed. */
export function scheduleTelemetryFlush(): void {
  const run = () => {
    void flushTelemetry()
  }
  try {
    after(run)
  } catch {
    run()
  }
}
