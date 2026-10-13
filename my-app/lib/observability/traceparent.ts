const TRACEPARENT =
  /^[\s]*([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})[\s]*$/i

export type ParsedTraceparent = {
  traceparent: string
  tracestate?: string
}

export function parseTraceparent(
  header: string | null | undefined,
  tracestate?: string | null,
): ParsedTraceparent | null {
  if (!header) return null
  const match = TRACEPARENT.exec(header)
  if (!match) return null
  const [, version, traceId, spanId, flags] = match
  if (version !== '00') return null
  if (/^0{32}$/.test(traceId)) return null
  if (/^0{16}$/.test(spanId)) return null

  const parsed: ParsedTraceparent = {
    traceparent: `00-${traceId.toLowerCase()}-${spanId.toLowerCase()}-${flags.toLowerCase()}`,
  }
  if (tracestate && isSafeTracestate(tracestate)) parsed.tracestate = tracestate.trim()
  return parsed
}

function isSafeTracestate(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 512) return false
  return /^[\t\x20-\x7e]+$/.test(trimmed)
}
