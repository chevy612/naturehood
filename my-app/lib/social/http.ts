import { NextResponse } from 'next/server'
import { API_CORS_ALLOW_HEADERS, API_CORS_EXPOSE_HEADERS } from '@/lib/observability/cors'
import { failure } from './api-response'

export const SOCIAL_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': API_CORS_ALLOW_HEADERS,
  'Access-Control-Expose-Headers': API_CORS_EXPOSE_HEADERS,
}

export function socialOptions() {
  return new NextResponse(null, { status: 204, headers: SOCIAL_CORS_HEADERS })
}

export function socialJson<T>(response: NextResponse<T>) {
  for (const [name, value] of Object.entries(SOCIAL_CORS_HEADERS)) {
    response.headers.set(name, value)
  }
  return response
}

export function socialFailure(message: string, status: number) {
  return socialJson(failure(message, status))
}

export function socialErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  if (
    message === 'Invalid pagination cursor' ||
    message.includes('limit must') ||
    message.includes('Request body')
  ) return socialFailure(message, 400)
  if (message.includes('not found')) return socialFailure(message, 404)
  if (message.includes('not authorized')) return socialFailure(message, 403)
  return socialFailure('An unexpected error occurred', 500)
}

export function readLimit(value: string | null, fallback = 20, maximum = 50) {
  if (value === null) return fallback
  if (!/^\d+$/.test(value)) throw new Error('limit must be an integer')
  const limit = Number.parseInt(value, 10)
  if (limit < 1) throw new Error('limit must be greater than zero')
  return Math.min(limit, maximum)
}
