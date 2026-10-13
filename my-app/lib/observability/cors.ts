export const API_CORS_ALLOW_HEADERS =
  'Content-Type, Authorization, traceparent, tracestate, X-Request-ID'

export const API_CORS_EXPOSE_HEADERS = 'X-Request-ID'

const CORRELATION_ALLOW = ['traceparent', 'tracestate', 'X-Request-ID']

export function applyCorrelationHeaders(response: Response, requestId: string): void {
  response.headers.set('X-Request-ID', requestId)

  const expose = new Set(
    (response.headers.get('Access-Control-Expose-Headers') ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  )
  expose.add('X-Request-ID')
  response.headers.set('Access-Control-Expose-Headers', [...expose].join(', '))

  const allowHeader = response.headers.get('Access-Control-Allow-Headers')
  if (allowHeader === null) return

  const allow = new Set(
    allowHeader
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  )
  for (const header of CORRELATION_ALLOW) {
    const exists = [...allow].some((item) => item.toLowerCase() === header.toLowerCase())
    if (!exists) allow.add(header)
  }
  response.headers.set('Access-Control-Allow-Headers', [...allow].join(', '))
}
