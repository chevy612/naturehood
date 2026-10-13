import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest } from 'next/server'
import { getAuthenticatedSocialClient } from '@/lib/social/auth'
import { socialFailure, socialOptions } from '@/lib/social/http'
import { finishSseConnection, noteSseSubscriptionError } from '@/lib/observability/sse'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function handleOPTIONS() {
  return socialOptions()
}

async function handleGET(request: NextRequest) {
  const authenticated = await getAuthenticatedSocialClient(request)
  if (!authenticated) return socialFailure('Unauthorized', 401)

  const { data: follows, error } = await authenticated.supabase
    .from('social_follows')
    .select('followee_id')
    .eq('follower_id', authenticated.userId)
  if (error) return socialFailure(error.message, 500)

  const acceptedAuthors = new Set([
    authenticated.userId,
    ...(follows ?? []).map((follow) => follow.followee_id),
  ])
  const encoder = new TextEncoder()
  let channel: RealtimeChannel | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let closed = false
  let closeStream: () => void = () => {}

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (value: string) => {
        if (!closed) controller.enqueue(encoder.encode(value))
      }
      const close = () => {
        if (closed) return
        closed = true
        if (heartbeat) clearInterval(heartbeat)
        if (channel) void channel.unsubscribe()
        finishSseConnection(request.signal, 'close')
        controller.close()
      }
      closeStream = close

      send(': connected\nevent: ping\ndata: \n\n')
      heartbeat = setInterval(() => send(': heartbeat\n\n'), 30_000)
      channel = authenticated.supabase
        .channel(`social-feed-sse:${authenticated.userId}:${crypto.randomUUID()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'social_posts' },
          ({ new: post }) => {
            const event = post as {
              id: string
              author_id: string
              content: string | null
              images: string[] | null
              created_at: string
              like_count: number
              comment_count: number
              repost_count: number
            }
            if (!acceptedAuthors.has(event.author_id)) return
            send(`event: new-post\ndata: ${JSON.stringify({
              id: event.id,
              authorId: event.author_id,
              content: event.content ?? undefined,
              images: event.images ?? [],
              createdAt: event.created_at,
              likeCount: event.like_count,
              commentCount: event.comment_count,
              repostCount: event.repost_count,
            })}\n\n`)
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            noteSseSubscriptionError(status, request.signal)
          }
        })

      request.signal.addEventListener('abort', close, { once: true })
    },
    cancel() {
      closeStream()
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization, traceparent, tracestate, X-Request-ID',
      'access-control-expose-headers': 'X-Request-ID',
    },
  })
}

export const OPTIONS = observeApiRoute('/api/feed/stream', 'OPTIONS', handleOPTIONS, { sse: true })
export const GET = observeApiRoute('/api/feed/stream', 'GET', handleGET, { sse: true })
