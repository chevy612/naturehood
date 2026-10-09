import { registerOTel, type Configuration } from '@vercel/otel'
import { ExportResultCode } from '@opentelemetry/core'
import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base'
import {
  deploymentEnvironment,
  deploymentVersion,
  otlpEndpoint,
  otlpHeaders,
  otlpHost,
  SERVICE_NAME,
  telemetryDisabled,
} from './config'
import { initLogExporter } from './otlp'
import { RedactingSpanProcessor } from './spans'

let started = false

export function startTelemetry(): void {
  if (started || telemetryDisabled()) return
  started = true

  const endpoint = otlpEndpoint()
  const headerNames = Object.keys(otlpHeaders())
  const ignoreUrls: (string | RegExp)[] = [/\/v1\/(traces|logs|metrics)(?:$|\?)/]
  if (endpoint) {
    try {
      ignoreUrls.push(new RegExp(escapeRegExp(new URL(endpoint).origin)))
    } catch {
      // invalid endpoint is ignored; export will fail closed inside the exporter
    }
  }

  const configuration: Configuration = {
    serviceName: SERVICE_NAME,
    traceSampler: 'always_on',
    attributes: {
      'service.version': deploymentVersion(),
      'deployment.environment.name': deploymentEnvironment(),
      environment: deploymentEnvironment(),
    },
    instrumentationConfig: {
      fetch: {
        ignoreUrls,
        propagateContextUrls: [
          /^https:\/\/.+\.supabase\.co/,
          'https://api.resend.com',
          'https://api.anthropic.com',
          'https://api.moonshot.ai',
          'https://open.bigmodel.cn',
          'https://exp.host',
        ],
        dontPropagateContextUrls: endpoint ? [endpoint] : [],
      },
    },
    spanProcessors: [new RedactingSpanProcessor(), 'auto'],
  }

  if (!endpoint) {
    configuration.traceExporter = noopTraceExporter
  }

  registerOTel(configuration)
  initLogExporter()

  console.info(
    JSON.stringify({
      event: 'telemetry.config',
      service_name: SERVICE_NAME,
      sampler: 'always_on',
      environment: deploymentEnvironment(),
      deployment_version: deploymentVersion(),
      otlp_endpoint_configured: Boolean(endpoint),
      otlp_host: otlpHost(),
      otlp_header_names: headerNames,
      request_logs_follow_trace_sampling: false,
      note: 'Application sampling is always_on. Compare span counts with http.request logs on a Vercel preview; hobby freezes and collector outages can still drop telemetry.',
    }),
  )
}

const noopTraceExporter: SpanExporter = {
  export(_spans: ReadableSpan[], resultCallback) {
    resultCallback({ code: ExportResultCode.SUCCESS })
  },
  shutdown() {
    return Promise.resolve()
  },
  forceFlush() {
    return Promise.resolve()
  },
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
