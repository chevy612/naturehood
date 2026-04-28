import { NextRequest } from 'next/server'
import { handleStripeWebhook } from '@/src/controllers/webhookController'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')
  return handleStripeWebhook(rawBody, signature)
}
