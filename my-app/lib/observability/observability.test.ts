import assert from 'node:assert/strict'
import { describe, it, before } from 'node:test'
import { context, propagation, trace } from '@opentelemetry/api'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NextRequest, NextResponse } from 'next/server'
import { buildAvatarLogEntry } from './client-log'
import { pseudonymousUserRef } from './context'
import { getRequestContext } from './context'
import { flushTelemetry, setTelemetryFlushOverrideForTests } from './otlp'
import { redactSpan, redactString, sanitizeValue } from './redact'
import { parseTraceparent } from './traceparent'
import { observeApiRoute } from './with-api-route'
import { withServerAction } from './with-server-action'
import logger from '../logger'

const spanExporter = new InMemorySpanExporter()

before(() => {
  const manager = new AsyncLocalStorageContextManager()
  manager.enable()
  context.setGlobalContextManager(manager)
  propagation.setGlobalPropagator(new W3CTraceContextPropagator())
  const provider = new BasicTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(spanExporter)],
  })
  trace.setGlobalTracerProvider(provider)
})

function capture(fn: () => Promise<void> | void) {
  const lines: Array<{ level: string; record: Record<string, unknown> }> = []
  const original = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  }
  const wrap = (level: string) => (...args: unknown[]) => {
    const first = args[0]
    if (typeof first === 'string' && first.startsWith('{')) {
      try {
        lines.push({ level, record: JSON.parse(first) as Record<string, unknown> })
        return
      } catch {
        // fall through
      }
    }
  }
  console.debug = wrap('debug')
  console.info = wrap('info')
  console.warn = wrap('warn')
  console.error = wrap('error')
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      console.debug = original.debug
      console.info = original.info
      console.warn = original.warn
      console.error = original.error
    })
    .then(() => lines)
}

describe('redaction', () => {
  it('removes secrets, signed urls, bodies, and food or workout content', () => {
    const signed = 'https://project.supabase.co/storage/v1/object/sign/meals/a.jpg?token=secret-token&X-Amz-Signature=abc'
    const sanitized = sanitizeValue({
      password: 'hunter2',
      otp: '123456',
      code: '123456',
      authorization: 'Bearer abc.def.ghi',
      cookie: 'sb=secret',
      apiKey: 'sk-live',
      email: 'athlete@example.com',
      userId: 'user-123',
      workout_log: '5x5 squat',
      body: { meal_summary: 'rice and chicken' },
      note: `see ${signed}`,
      content: 'post body',
    }) as Record<string, unknown>

    const encoded = JSON.stringify(sanitized)
    assert.equal(encoded.includes('hunter2'), false)
    assert.equal(encoded.includes('123456'), false)
    assert.equal(encoded.includes('secret-token'), false)
    assert.equal(encoded.includes('athlete@example.com'), false)
    assert.equal(encoded.includes('5x5 squat'), false)
    assert.equal(encoded.includes('rice and chicken'), false)
    assert.equal(encoded.includes('post body'), false)
    assert.equal(encoded.includes('user-123'), false)
    assert.equal(typeof sanitized.user_ref, 'string')
    assert.match(redactString(signed), /token=%5Bredacted%5D|token=\[redacted\]/)
  })

  it('redacts span urls and sensitive attribute names', () => {
    const span = {
      name: 'GET https://cdn.example/file?token=abc',
      attributes: {
        'http.url': 'https://cdn.example/file?token=abc',
        'http.request.header.authorization': 'Bearer secret',
        'http.route': '/api/posts/[postId]',
        'gen_ai.prompt': 'describe my meal',
      },
    }
    redactSpan(span)
    assert.equal(String(span.attributes['http.request.header.authorization']), '[redacted]')
    assert.equal(String(span.attributes['gen_ai.prompt']), '[redacted]')
    assert.equal(span.attributes['http.route'], '/api/posts/[postId]')
    assert.equal(JSON.stringify(span).includes('token=abc'), false)
  })
})

describe('client log allowlist', () => {
  it('keeps server-owned identity and event when meta tries to overwrite them', () => {
    const entry = buildAvatarLogEntry({
      userId: 'user-1',
      event: 'avatar.upload.error',
      reason: 'network',
      meta: {
        userId: 'attacker',
        user_ref: 'attacker',
        event: 'avatar.upload.success',
        reason: 'client-reason',
        password: 'hunter2',
        stage: 'crop',
        bytes: 1200,
        extra: 'ignore-me',
      },
    })
    assert.equal(entry.event, 'avatar.upload.error')
    assert.equal(entry.user_ref, pseudonymousUserRef('user-1'))
    assert.notEqual(entry.user_ref, 'attacker')
    assert.equal(entry.reason, 'network')
    assert.equal(entry.stage, 'crop')
    assert.equal(entry.bytes, 1200)
    assert.equal('password' in entry, false)
    assert.equal('userId' in entry, false)
  })
})

describe('traceparent', () => {
  it('accepts a valid w3c header and rejects malformed or zero ids', () => {
    const valid = parseTraceparent(
      '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01',
      'vendor=value',
    )
    assert.equal(valid?.traceparent, '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01')
    assert.equal(valid?.tracestate, 'vendor=value')
    assert.equal(parseTraceparent('not-a-header'), null)
    assert.equal(parseTraceparent('00-' + '0'.repeat(32) + '-00f067aa0ba902b7-01'), null)
    assert.equal(parseTraceparent('00-4bf92f3577b34da6a3ce929d0e0e4736-' + '0'.repeat(16) + '-01'), null)
    assert.equal(parseTraceparent('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01', 'bad\nstate')?.tracestate, undefined)
  })
})

describe('api route wrapper', () => {
  it('returns a request id, continues a valid traceparent, and isolates concurrent calls', async () => {
    const traceId = '4bf92f3577b34da6a3ce929d0e0e4736'
    let release: () => void = () => {}
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const seen: string[] = []
    const handler = observeApiRoute('/api/posts/[postId]', 'GET', async () => {
      seen.push(getRequestContext()?.requestId ?? '')
      await gate
      const response = NextResponse.json({ ok: true })
      response.cookies.set('sb-access-token', 'secret-cookie', { httpOnly: true })
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    })

    const lines = await capture(async () => {
      const first = handler(
        new NextRequest('http://localhost/api/posts/1', {
          headers: { traceparent: `00-${traceId}-00f067aa0ba902b7-01` },
        }),
        {},
      )
      const second = handler(new NextRequest('http://localhost/api/posts/2'), {})
      release()
      const [left, right] = await Promise.all([first, second])
      assert.notEqual(left.headers.get('X-Request-ID'), right.headers.get('X-Request-ID'))
      assert.match(left.headers.get('Access-Control-Allow-Headers') ?? '', /traceparent/)
      assert.match(left.headers.get('Access-Control-Expose-Headers') ?? '', /X-Request-ID/)
      assert.match(left.headers.get('set-cookie') ?? '', /secret-cookie/)
      const spans = spanExporter.getFinishedSpans()
      const matched = spans.find((span) => span.spanContext().traceId === traceId)
      assert.ok(matched)
      assert.equal(matched?.attributes['http.route'], '/api/posts/[postId]')
    })

    assert.equal(new Set(seen).size, 2)
    const completions = lines.filter((line) => line.record.event === 'http.request')
    assert.equal(completions.length, 2)
    assert.equal(JSON.stringify(lines).includes('secret-cookie'), false)
    assert.equal(completions.some((line) => line.record.trace_id === traceId), true)
  })

  it('logs validation and thrown errors without failing the flush, and preserves OPTIONS', async () => {
    setTelemetryFlushOverrideForTests(async () => {
      throw new Error('collector down')
    })
    try {
      const lines = await capture(async () => {
        const options = observeApiRoute('/api/posts', 'OPTIONS', () =>
          new Response(null, {
            status: 204,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          }),
        )
        const validation = observeApiRoute('/api/posts', 'POST', () =>
          NextResponse.json({ error: 'Invalid request body' }, { status: 400 }),
        )
        const crashed = observeApiRoute('/api/posts', 'POST', () => {
          throw new Error('password=hunter2')
        })

        const optionsResponse = await options(new NextRequest('http://localhost/api/posts'), {})
        assert.equal(optionsResponse.status, 204)
        assert.match(optionsResponse.headers.get('Access-Control-Allow-Headers') ?? '', /traceparent/)
        assert.ok(optionsResponse.headers.get('X-Request-ID'))

        const invalid = await validation(new NextRequest('http://localhost/api/posts'), {})
        assert.equal(invalid.status, 400)

        await assert.rejects(() =>
          Promise.resolve(crashed(new NextRequest('http://localhost/api/posts'), {})),
        )
        await flushTelemetry()
      })

      const records = lines.map((line) => line.record)
      assert.equal(records.some((record) => record.http_status === 204), true)
      assert.equal(records.some((record) => record.http_status === 400 && record.severity === 'warn'), true)
      assert.equal(records.some((record) => record.outcome === 'exception'), true)
      assert.equal(JSON.stringify(records).includes('hunter2'), false)
    } finally {
      setTelemetryFlushOverrideForTests(null)
    }
  })

  it('does not read an SSE body and records cancellation', async () => {
    const controller = new AbortController()
    const request = new NextRequest('http://localhost/api/feed/stream', { signal: controller.signal })
    const handler = observeApiRoute(
      '/api/feed/stream',
      'GET',
      () => {
        const stream = new ReadableStream({
          start(streamController) {
            streamController.enqueue(new TextEncoder().encode('data: hi\n\n'))
          },
        })
        return new Response(stream, {
          status: 200,
          headers: { 'content-type': 'text/event-stream' },
        })
      },
      { sse: true },
    )

    const lines = await capture(async () => {
      const response = await handler(request, {})
      const reader = response.body?.getReader()
      assert.ok(reader)
      const chunk = await reader.read()
      assert.equal(new TextDecoder().decode(chunk.value), 'data: hi\n\n')
      controller.abort()
    })

    const events = lines.map((line) => line.record.event)
    assert.ok(events.includes('sse.open'))
    assert.ok(events.includes('sse.disconnect'))
    assert.ok(events.includes('sse.lifetime'))
    assert.equal(JSON.stringify(lines).includes('data: hi'), false)
  })
})

describe('server actions', () => {
  it('records redirects as redirects and returned errors as handled failures', async () => {
    const lines = await capture(async () => {
      const redirect = Object.assign(new Error('NEXT_REDIRECT'), {
        digest: 'NEXT_REDIRECT;replace;/login;307;',
      })
      await assert.rejects(
        () => withServerAction('signOut', async () => {
          throw redirect
        }),
        (error: unknown) => (error as { digest?: string }).digest?.startsWith('NEXT_REDIRECT') === true,
      )
      const result = await withServerAction('loginUser', async () => ({ error: 'Invalid email or password' }))
      assert.deepEqual(result, { error: 'Invalid email or password' })
    })
    const actions = lines.filter((line) => line.record.event === 'server_action').map((line) => line.record)
    assert.equal(actions.some((record) => record.outcome === 'redirect' && record.severity === 'info'), true)
    assert.equal(actions.some((record) => record.outcome === 'error' && record.severity === 'warn'), true)
    assert.equal(actions.some((record) => record.severity === 'error' && record.outcome === 'redirect'), false)
  })
})

describe('logger', () => {
  it('keeps the call shape and emits a sanitized structured line', async () => {
    const lines = await capture(() => {
      logger.info('[avatar]', { event: 'avatar.upload.success', password: 'hunter2' })
    })
    assert.equal(lines.length, 1)
    assert.equal(lines[0].record.event, 'log')
    assert.equal(JSON.stringify(lines[0].record).includes('hunter2'), false)
    assert.match(String(lines[0].record.message), /avatar/)
  })
})
