import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/src/utils/stripe'
import { getSupabaseAdminClient } from '@/src/utils/supabaseAdmin'
import logger from '@/lib/logger'

type Tier = 'rooted' | 'canopy'
type Interval = 'month' | 'year'

function normalizeTier(value: unknown): Tier | null {
  if (value === 'rooted' || value === 'canopy') return value
  return null
}

function normalizeInterval(value: unknown): Interval | null {
  if (value === 'month' || value === 'year') return value
  return null
}

function deriveTierAndInterval(
  subscription: Stripe.Subscription
): { tier: Tier | null; interval: Interval | null } {
  const metadataTier = normalizeTier(subscription.metadata.tier)
  const metadataInterval = normalizeInterval(subscription.metadata.interval)

  const firstItem = subscription.items.data[0]
  const recurringInterval = firstItem?.price?.recurring?.interval
  const priceInterval = recurringInterval === 'month' || recurringInterval === 'year'
    ? recurringInterval
    : null

  return {
    tier: metadataTier,
    interval: metadataInterval ?? priceInterval,
  }
}

async function markEventStarted(eventId: string, eventType: string) {
  const admin = getSupabaseAdminClient()
  const { error } = await admin.from('stripe_webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
  })

  if (error) {
    if (error.code === '23505') {
      return false
    }
    throw new Error(`Failed to store webhook event: ${error.message}`)
  }

  return true
}

async function removeEventMarker(eventId: string) {
  const admin = getSupabaseAdminClient()
  await admin.from('stripe_webhook_events').delete().eq('event_id', eventId)
}

async function upsertProfileFromSubscription(subscription: Stripe.Subscription) {
  const admin = getSupabaseAdminClient()
  const userId = subscription.metadata.userId
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  const firstItem = subscription.items.data[0]
  const { tier, interval } = deriveTierAndInterval(subscription)
  const payload = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: firstItem?.price?.id ?? null,
    subscription_tier: tier,
    subscription_interval: interval,
    subscription_status: subscription.status,
    subscription_current_period_end: firstItem?.current_period_end
      ? new Date(firstItem.current_period_end * 1000).toISOString()
      : null,
    subscription_cancel_at_period_end: subscription.cancel_at_period_end,
    subscription_updated_at: new Date().toISOString(),
  }

  if (userId) {
    const { error } = await admin.from('profiles').update(payload).eq('id', userId)
    if (!error) return
    logger.warn('[stripe-webhook] userId profile update failed, falling back to customer id', error)
  } else {
    logger.warn('[stripe-webhook] Missing userId in subscription metadata', subscription.id)
  }

  const { error: fallbackError } = await admin
    .from('profiles')
    .update(payload)
    .eq('stripe_customer_id', customerId)

  if (fallbackError) {
    throw new Error(`Failed to update profile from subscription webhook: ${fallbackError.message}`)
  }
}

async function updateLastInvoicePaidAt(invoice: Stripe.Invoice) {
  const admin = getSupabaseAdminClient()
  const customerId =
    typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id ?? null

  if (!customerId || !invoice.status_transitions.paid_at) {
    return
  }

  const { error } = await admin
    .from('profiles')
    .update({
      stripe_last_invoice_paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    throw new Error(`Failed to update invoice paid timestamp: ${error.message}`)
  }
}

async function clearDeletedSubscription(subscription: Stripe.Subscription) {
  const admin = getSupabaseAdminClient()
  const userId = subscription.metadata.userId

  if (userId) {
    const { error } = await admin
      .from('profiles')
      .update({
        stripe_subscription_id: null,
        stripe_price_id: null,
        subscription_status: 'canceled',
        subscription_current_period_end: null,
        subscription_cancel_at_period_end: false,
        subscription_tier: null,
        subscription_interval: null,
        subscription_updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to clear deleted subscription by user id: ${error.message}`)
    }
    return
  }

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null

  if (!customerId) {
    return
  }

  const { error } = await admin
    .from('profiles')
    .update({
      stripe_subscription_id: null,
      stripe_price_id: null,
      subscription_status: 'canceled',
      subscription_current_period_end: null,
      subscription_cancel_at_period_end: false,
      subscription_tier: null,
      subscription_interval: null,
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    throw new Error(`Failed to clear deleted subscription by customer id: ${error.message}`)
  }
}

export async function handleStripeWebhook(rawBody: string, signature: string | null) {
  try {
    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature header' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 })
    }

    const stripe = getStripeClient()
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)

    const isNewEvent = await markEventStarted(event.id, event.type)
    if (!isNewEvent) {
      return NextResponse.json({ received: true })
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          await upsertProfileFromSubscription(subscription)
          break
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          await clearDeletedSubscription(subscription)
          break
        }
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice
          await updateLastInvoicePaidAt(invoice)
          break
        }
        default: {
          logger.info('[stripe-webhook] Unhandled event type', event.type)
          break
        }
      }
    } catch (eventError) {
      await removeEventMarker(event.id)
      throw eventError
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handling failed'
    logger.error('[stripe-webhook] error', message)
    if (message.toLowerCase().includes('signature')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
