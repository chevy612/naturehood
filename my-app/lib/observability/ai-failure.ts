/**
 * Maps an AI provider failure to a short, non-sensitive reason code for the
 * `dependency` record. Never includes prompts, model output, keys, or URLs.
 */
export function aiFailureReason(error: unknown): string {
  if (!(error instanceof Error)) return 'provider_error'

  if (error.message.startsWith('[ai-client]') && error.message.endsWith('is not set')) {
    return 'ai_not_configured'
  }
  if (error.message.startsWith('[food-analysis] Unknown provider')) return 'ai_unknown_provider'

  const status = (error as { status?: unknown }).status
  if (typeof status === 'number' && Number.isInteger(status)) return `provider_http_${status}`

  if (error.name === 'APIConnectionTimeoutError' || /timed? ?out/i.test(error.message)) {
    return 'provider_timeout'
  }
  if (error.name === 'APIConnectionError') return 'provider_unreachable'
  if (error.name === 'SyntaxError') return 'json_parse'
  return 'provider_error'
}
