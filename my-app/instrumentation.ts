export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') return
  const { startTelemetry } = await import('@/lib/observability/register-node')
  startTelemetry()
}
