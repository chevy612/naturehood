import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { ok } from '@/lib/social/api-response'
import { socialFailure, socialJson, socialOptions } from '@/lib/social/http'
import logger from '@/lib/logger'
import { buildAvatarLogEntry } from '@/lib/observability/client-log'

const ALLOWED_EVENTS = [
  'avatar.upload.attempt',
  'avatar.upload.success',
  'avatar.upload.error',
] as const

type AllowedEvent = (typeof ALLOWED_EVENTS)[number]

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function handleOPTIONS() {
  return socialOptions()
}

async function handlePOST(request: NextRequest) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return socialFailure('Request body must be valid JSON', 400)
  }
  if (!isPlainObject(body)) return socialFailure('Request body must be an object', 400)

  const event = body.event
  if (typeof event !== 'string' || !ALLOWED_EVENTS.includes(event as AllowedEvent)) {
    return socialFailure('Invalid event', 400)
  }

  const reason =
    typeof body.reason === 'string' ? body.reason.slice(0, 200) : undefined
  const meta = isPlainObject(body.meta) ? body.meta : undefined

  // Server-owned identity and event are applied after the allowlisted meta.
  const entry = buildAvatarLogEntry({
    userId: authenticated.userId,
    event,
    reason,
    meta,
  })

  if (event === 'avatar.upload.error') {
    logger.error('[avatar]', entry)
  } else {
    logger.info('[avatar]', entry)
  }

  return socialJson(ok({ received: true }))
}

export const OPTIONS = observeApiRoute('/api/log', 'OPTIONS', handleOPTIONS)
export const POST = observeApiRoute('/api/log', 'POST', handlePOST)
