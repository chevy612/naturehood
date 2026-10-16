import type { Instrumentation } from 'next'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') return
  const { startTelemetry } = await import('@/lib/observability/register-node')
  startTelemetry()
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME === 'edge') return
  const { recordRequestError } = await import('@/lib/observability/request-error')
  await recordRequestError(error, request, context)
}
