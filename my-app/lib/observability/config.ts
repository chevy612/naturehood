export const SERVICE_NAME = 'naturehood-backend'

export function deploymentEnvironment(): string {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'
}

export function deploymentVersion(): string {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    'local'
  )
}

/** Base OTLP URL without a signal path. Traces and logs append /v1/traces and /v1/logs. */
export function otlpEndpoint(): string | null {
  const raw =
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    ''
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return null
  return trimmed.replace(/\/v1\/(traces|logs|metrics)$/, '')
}

export function otlpLogsEndpoint(): string | null {
  const explicit = process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const base = otlpEndpoint()
  return base ? `${base}/v1/logs` : null
}

/**
 * Parses the OTEL header list format: `Authorization=Bearer%20token,Other=value`.
 * Values are URL-decoded. The token itself is never logged.
 */
export function otlpHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const raw = [
    process.env.OTEL_EXPORTER_OTLP_HEADERS,
    process.env.OTEL_EXPORTER_OTLP_LOGS_HEADERS,
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(',')

  if (!raw) return headers

  for (const part of raw.split(',')) {
    const eq = part.indexOf('=')
    if (eq <= 0) continue
    const key = part.slice(0, eq).trim()
    const value = decodeURIComponent(part.slice(eq + 1).trim())
    if (key && value) headers[key] = value
  }
  return headers
}

export function otlpHost(): string | null {
  const endpoint = otlpEndpoint()
  if (!endpoint) return null
  try {
    return new URL(endpoint).host
  } catch {
    return null
  }
}

export function telemetryDisabled(): boolean {
  return process.env.OTEL_SDK_DISABLED === 'true'
}
