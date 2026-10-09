import { pseudonymousUserRef } from './context'

const SENSITIVE_KEY =
  /^(password|passwd|new_password|current_password|confirm_password|otp|verification_code|authorization|proxy-authorization|cookie|cookies|set-cookie|api_key|apikey|api-key|secret|service_role|service_role_key|access_token|refresh_token|id_token|bearer|session|html|base64|base64image|base64_image|image|images|workout_log|workoutlog|user_notes|usernotes|meal_summary|ingredients|prompt|messages|completion|request_body|response_body|body|raw_text|food|meal|content|token|expo_push_token|push_token|email|to|from|reply_to|replyto|cc|bcc)$/i

const SENSITIVE_SPAN_KEY =
  /(authorization|cookie|set-cookie|api[_-]?key|password|passwd|otp|secret|token|session|request.body|response.body|prompt|workout|food|meal|user_notes|base64|email|db\.statement)/i

const SENSITIVE_QUERY =
  /^(token|sig|signature|x-amz-signature|x-amz-credential|x-amz-security-token|x-amz-algorithm|x-amz-date|api_key|apikey|access_token|refresh_token|authorization)$/i

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
const BEARER = /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi
const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}/g
const SECRET_ASSIGNMENT =
  /(password|passwd|otp|api[_-]?key|secret|authorization|cookie|token)\s*[=:]\s*\S+/gi
const CONTENT_MARKER =
  /"(workout_log|meal_summary|user_notes|base64|base64Image|ingredients|workoutLog)"/

const MAX_STRING = 500
const MAX_DEPTH = 6
const MAX_KEYS = 40
const MAX_ARRAY = 20

function normalizeKey(key: string): string {
  return key.replace(/[-.\s]/g, '_').toLowerCase()
}

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY.test(normalizeKey(key))
}

export function redactString(input: string): string {
  if (input.length > 180 && CONTENT_MARKER.test(input)) return '[redacted-content]'

  let value = input
    .replace(BEARER, 'Bearer [redacted]')
    .replace(JWT, '[redacted-jwt]')
    .replace(SECRET_ASSIGNMENT, '$1=[redacted]')
    .replace(EMAIL, '[redacted-email]')

  value = redactUrlsInText(value)
  if (value.length > MAX_STRING) value = `${value.slice(0, MAX_STRING)}…`
  return value
}

function redactUrlsInText(value: string): string {
  return value.replace(/https?:\/\/[^\s"'<>]+/gi, (url) => redactUrl(url))
}

export function redactUrl(raw: string): string {
  try {
    const url = new URL(raw)
    for (const key of [...url.searchParams.keys()]) {
      if (SENSITIVE_QUERY.test(key)) url.searchParams.set(key, '[redacted]')
    }
    return url.toString()
  } catch {
    return raw.replace(
      /([?&](?:token|signature|sig|X-Amz-[A-Za-z-]+|api_key|access_token)=)[^&\s]+/gi,
      '$1[redacted]',
    )
  }
}

function redactOtpCode(key: string, value: unknown): unknown {
  if (normalizeKey(key) !== 'code') return value
  if (typeof value === 'string' && /^\d{4,8}$/.test(value)) return '[redacted]'
  if (typeof value === 'number' && value >= 1000 && value <= 99_999_999) return '[redacted]'
  return value
}

export function sanitizeValue(value: unknown, depth = 0, key = ''): unknown {
  if (key && isSensitiveKey(key)) return '[redacted]'
  if (key) {
    const otpChecked = redactOtpCode(key, value)
    if (otpChecked !== value) return otpChecked
  }
  if (value == null) return value
  if (typeof value === 'string') return redactString(value)
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'boolean') return value
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'function') return '[function]'
  if (typeof Headers !== 'undefined' && value instanceof Headers) return '[headers]'
  if (typeof FormData !== 'undefined' && value instanceof FormData) return '[form-data]'
  if (typeof value === 'object' && value && 'arrayBuffer' in value && typeof Blob !== 'undefined' && value instanceof Blob) {
    return '[binary]'
  }
  if (Buffer.isBuffer(value)) return '[binary]'

  if (depth >= MAX_DEPTH) return '[truncated]'

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
    }
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY).map((item) => sanitizeValue(item, depth + 1))
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_KEYS)
    for (const [childKey, child] of entries) {
      if (isSensitiveKey(childKey)) {
        out[childKey] = '[redacted]'
        continue
      }
      if (/^(user_?id|sub|author_id)$/i.test(childKey) && typeof child === 'string') {
        out.user_ref = pseudonymousUserRef(child)
        continue
      }
      const otpChecked = redactOtpCode(childKey, child)
      out[childKey] = sanitizeValue(otpChecked, depth + 1, childKey)
    }
    return out
  }

  return '[unserializable]'
}

export function sanitizeError(error: unknown): { error_type: string; error_message: string } {
  if (error instanceof Error) {
    return {
      error_type: error.name || 'Error',
      error_message: redactString(error.message).slice(0, 300),
    }
  }
  return { error_type: 'unknown', error_message: 'unhandled error' }
}

export function redactSpan(span: { name: string; attributes: Record<string, unknown> }): void {
  if (/[?]/.test(span.name) || /bearer|token=|password=/i.test(span.name)) {
    const withoutQuery = span.name.split('?')[0] ?? span.name
    span.name = redactString(withoutQuery).slice(0, 200)
  }

  for (const key of Object.keys(span.attributes)) {
    if (SENSITIVE_SPAN_KEY.test(key) || isSensitiveKey(key)) {
      span.attributes[key] = '[redacted]'
      continue
    }
    const value = span.attributes[key]
    if (typeof value === 'string') {
      span.attributes[key] = redactString(
        /url|target|path/i.test(key) ? redactUrl(value) : value,
      )
    }
  }
}
