# Naturehood log system

Self-hosted logs and traces for the Naturehood backend on Vercel Hobby. Grafana is the UI, Loki stores logs, Tempo stores traces, and Grafana Alloy receives OTLP. A TLS reverse proxy is the only public ingress.

Suggested VPS: 2–4 vCPU, 8 GB RAM, 80–100 GB SSD, in the same region as the Vercel project. Span volume dominates disk use. Watch Loki and Tempo volume usage before treating that size as enough for 30 days.

## What is exposed

| Public | Private (Docker network only) |
| --- | --- |
| `https://$INGEST_DOMAIN` → Alloy OTLP HTTP | Alloy `:4318` |
| `https://$GRAFANA_DOMAIN` → Grafana | Loki `:3100`, Tempo `:3200` and `:4317` |

Ingestion requires `Authorization: Bearer <INGEST_BEARER_TOKEN>`. Caddy and Alloy both check it. Caddy also caps request bodies at 1 MB and rate-limits each source IP (20 requests/second) plus a global cap (50 requests/second). Grafana anonymous access and sign-up are off; sign in with the admin user from `.env`.

Logs and traces are kept for 30 days (`720h`). Loki's compactor deletes expired chunks. Tempo's compactor drops blocks older than 30 days. Both use named Docker volumes.

`request_id`, `user_ref`, and `trace_id` are structured metadata, not Loki index labels. Index labels are only `service_name` and `environment`.

## Deploy

1. Point DNS `A`/`AAAA` records for the ingest and Grafana hostnames at the VPS.
2. Copy the env file and replace every placeholder:

```bash
cd naturehood-log-system
cp .env.example .env
```

3. Start the stack:

```bash
docker compose up -d --build
```

4. Open `https://$GRAFANA_DOMAIN` and sign in. The **Naturehood backend** dashboard is provisioned automatically. A `trace_id` in a log line opens the matching Tempo trace.

Container images are pinned in `docker-compose.yml`:

- `grafana/alloy:v1.20.1`
- `grafana/loki:3.6.17`
- `grafana/tempo:3.1.0`
- `grafana/grafana:13.2.3`
- Caddy `2.10.2` plus `caddy-ratelimit` at commit `5625512f24f6f59d6f64fb3aafe5eecff0b286db`

## Backend (Vercel)

Set these on the Vercel project as **server** environment variables. Do not use `NEXT_PUBLIC_*`.

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://otel.example.com
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer%20<INGEST_BEARER_TOKEN>
NATUREHOOD_USER_REF_SECRET=<long-random-string>
```

`OTEL_EXPORTER_OTLP_ENDPOINT` is the origin only. The SDK appends `/v1/traces` and `/v1/logs`.

`NATUREHOOD_USER_REF_SECRET` is the HMAC key for the pseudonymous `user_ref`. Without it, the app still hashes ids so raw user ids are not written, but the salt is not secret. Set the variable in production.

Application trace sampling is `always_on`. Request logs are written even when a span is not sampled. On boot the server prints one `telemetry.config` JSON line (host and header **names** only). On a preview deployment, compare `http.request` log counts with Tempo span counts. Vercel can still drop telemetry on a hard freeze, a platform reject, or a collector outage. Coverage means every API route and server action emits a record, not that the platform guarantees delivery.

Export traffic to the collector is excluded from fetch instrumentation so export calls do not create more telemetry.

## Records

Ordinary API calls emit `event=http.request` with timestamp, severity, environment, deployment version, method, route template (`/api/posts/[postId]`), status, duration, `request_id`, and `trace_id` / `span_id` when the span is valid. The response sets `X-Request-ID`. A valid W3C `traceparent` is continued; anything else is ignored. Client metadata is not trusted.

`/api/feed/stream` also emits `sse.open`, `sse.subscription_error`, `sse.disconnect`, and `sse.lifetime`. The response body is not read for logging. While the connection is open, the exporter flushes at most every 30 seconds for up to two hours.

Server Actions emit `event=server_action`. `redirect()` is `outcome=redirect`, not a failure.

Dependency spans cover Supabase RPC, storage upload, AI analysis, email, and push. Returned `{ error }` values are recorded even when the SDK does not throw. Supabase HTTP timing shows up on automatic fetch spans. PostgreSQL execution time inside Supabase does not.

## Verification that this repo cannot finish on Vercel

Run the local checks from `my-app`:

```bash
npx tsx --test lib/observability/*.test.ts
```

Those cover redaction, `/api/log` overwrite protection, traceparent validation, concurrent request ids, OPTIONS and correlation headers, cookie preservation, handled and unhandled errors, redirect classification, SSE cancellation without consuming the stream, and a collector flush failure.

Still check on a Vercel preview, because local tests do not reproduce the hobby runtime:

- Cookie session and bearer token requests both return `X-Request-ID` and a `user_ref` that is not the raw user id.
- `OPTIONS` preflight allows `traceparent`, `tracestate`, and `X-Request-ID`, and exposes `X-Request-ID`.
- Validation failures (`400`), handled `4xx`, and thrown errors show up as separate outcomes.
- Two overlapping requests keep distinct request ids.
- Login and other Server Actions that call `redirect()` are not counted as errors.
- Cancelling `/api/feed/stream` emits disconnect and lifetime records.
- Stop Alloy and confirm the API still returns its normal response.
- Cold start prints `telemetry.config`, then a single request produces a log. Compare that with Tempo before calling sampling verified.

Framework `404` / `405` responses and `proxy.ts` redirects are outside the route wrapper. Hit an unknown path and a protected page redirect and confirm they do not go through `http.request`.
