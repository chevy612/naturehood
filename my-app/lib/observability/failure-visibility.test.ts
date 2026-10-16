import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { aiFailureReason } from './ai-failure'
import { markErrorRecorded, recordRequestError } from './request-error'
import logger from '../logger'

function captureConsole(fn: () => Promise<void> | void) {
  const lines: Record<string, unknown>[] = []
  const originals = { debug: console.debug, info: console.info, warn: console.warn, error: console.error }
  const sink = (...args: unknown[]) => {
    const first = args[0]
    if (typeof first === 'string' && first.startsWith('{')) lines.push(JSON.parse(first))
  }
  console.debug = sink
  console.info = sink
  console.warn = sink
  console.error = sink
  return Promise.resolve()
    .then(fn)
    .finally(() => Object.assign(console, originals))
    .then(() => lines)
}

describe('aiFailureReason', () => {
  it('classifies configuration, http, timeout and parse failures without leaking details', () => {
    assert.equal(aiFailureReason(new Error('[ai-client] KIMI_API_KEY is not set')), 'ai_not_configured')
    assert.equal(
      aiFailureReason(Object.assign(new Error('401 sk-secret'), { status: 401 })),
      'provider_http_401',
    )
    assert.equal(
      aiFailureReason(Object.assign(new Error('Request timed out.'), { name: 'APIConnectionTimeoutError' })),
      'provider_timeout',
    )
    assert.equal(aiFailureReason(new SyntaxError('Unexpected token')), 'json_parse')
    assert.equal(aiFailureReason('boom'), 'provider_error')
  })
})

describe('ai-client', () => {
  const saved = {
    kimi: process.env.KIMI_API_KEY,
    moonshot: process.env.MOONSHOT_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
  }
  afterEach(() => {
    for (const [key, value] of [
      ['KIMI_API_KEY', saved.kimi],
      ['MOONSHOT_API_KEY', saved.moonshot],
      ['ANTHROPIC_API_KEY', saved.anthropic],
    ] as const) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })

  it('imports without provider keys and only fails when a client is requested', async () => {
    delete process.env.KIMI_API_KEY
    delete process.env.MOONSHOT_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    const mod = await import('../services/ai-client')
    assert.throws(() => mod.getKimiClient(), /KIMI_API_KEY is not set/)
    assert.throws(() => mod.getClaudeClient(), /ANTHROPIC_API_KEY is not set/)
  })

  it('accepts MOONSHOT_API_KEY as an alias', async () => {
    delete process.env.KIMI_API_KEY
    process.env.MOONSHOT_API_KEY = 'test-key'
    const mod = await import('../services/ai-client')
    assert.ok(mod.getKimiClient())
  })
})

describe('onRequestError recording', () => {
  const request = { path: '/api/ai/analyze-food?token=abc', method: 'POST' }
  const route = { routePath: '/api/ai/analyze-food', routeType: 'route', routerKind: 'App Router' }

  it('writes a sanitized http.unhandled_error record', async () => {
    const lines = await captureConsole(() =>
      recordRequestError(new Error('failed with Bearer abc.def.ghi'), request, route),
    )
    const record = lines.find((line) => line.event === 'http.unhandled_error')
    assert.ok(record)
    assert.equal(record.severity, 'error')
    assert.equal(record.http_route, '/api/ai/analyze-food')
    assert.equal(record.http_path, '/api/ai/analyze-food')
    assert.equal(JSON.stringify(record).includes('abc.def.ghi'), false)
  })

  it('skips errors a wrapper already recorded', async () => {
    const error = new Error('already logged')
    markErrorRecorded(error)
    const lines = await captureConsole(() => recordRequestError(error, request, route))
    assert.equal(lines.length, 0)
  })
})

describe('logger export', () => {
  it('does not export debug records to OTLP', async () => {
    const emitted: string[] = []
    const holder = globalThis as Record<string, unknown>
    const previous = holder.__naturehoodLoggerProvider
    holder.__naturehoodLoggerProvider = {
      getLogger: () => ({ emit: (entry: { severityText: string }) => emitted.push(entry.severityText) }),
    }
    try {
      await captureConsole(() => {
        logger.debug('debug line')
        logger.info('info line')
      })
    } finally {
      holder.__naturehoodLoggerProvider = previous
    }
    assert.deepEqual(emitted, ['INFO'])
  })
})
