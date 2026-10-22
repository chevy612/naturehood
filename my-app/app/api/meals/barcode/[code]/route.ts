import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { isValidBarcode, parseOpenFoodFactsProduct } from '@/lib/meals/barcode'
import logger from '@/lib/logger'
import { observeSupabaseAuth } from '@/lib/observability/supabase-auth'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, traceparent, tracestate, X-Request-ID',
  'Access-Control-Expose-Headers': 'X-Request-ID',
}

const OFF_FIELDS = 'product_name,brands,serving_quantity,nutriments'
// Open Food Facts asks API clients to identify themselves.
const OFF_USER_AGENT = 'NATUREHOOD/0.1 (meal log)'

async function handleOPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

async function handleGET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  // ── Auth — cookie (web) or Bearer token (mobile), as in /api/ai/analyze-food ──
  const authHeader = req.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const supabase = observeSupabaseAuth(bearerToken
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
      )
    : await createClient())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS })
  }

  const { code } = await params
  if (!isValidBarcode(code)) {
    return NextResponse.json({ error: 'That is not a valid barcode.' }, { status: 400, headers: CORS_HEADERS })
  }

  let payload: unknown
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${OFF_FIELDS}`,
      { headers: { 'User-Agent': OFF_USER_AGENT }, next: { revalidate: 60 * 60 * 24 } }
    )
    if (!res.ok && res.status !== 404) throw new Error(`Open Food Facts responded ${res.status}`)
    payload = await res.json()
  } catch (err) {
    logger.error('[barcode-route] Lookup failed:', err)
    return NextResponse.json(
      { error: 'Could not look up this barcode right now.' },
      { status: 502, headers: CORS_HEADERS }
    )
  }

  const product = parseOpenFoodFactsProduct(code, payload)
  if (!product) {
    return NextResponse.json(
      { error: 'We could not find this product. Enter the nutrition yourself.' },
      { status: 404, headers: CORS_HEADERS }
    )
  }
  return NextResponse.json({ product }, { headers: CORS_HEADERS })
}

export const OPTIONS = observeApiRoute('/api/meals/barcode/[code]', 'OPTIONS', handleOPTIONS)
export const GET = observeApiRoute('/api/meals/barcode/[code]', 'GET', handleGET)
