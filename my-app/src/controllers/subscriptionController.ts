import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient, getOrCreateCustomer } from '@/src/utils/stripe'
import { getSupabaseAdminClient } from '@/src/utils/supabaseAdmin'
import { createClient } from '@/lib/supabase/server'

type Tier = 'rooted' | 'canopy'
type Interval = 'month' | 'year'

type CreateSubscriptionBody = {
  tier?: Tier
  interval?: Interval
  userId?: string
}

type CancelSubscriptionBody = {
  userId?: string
}

function isTier(value: unknown): value is Tier {
  return value === 'rooted' || value === 'canopy'
}

function isInterval(value: unknown): value is Interval {
  return value === 'month' || value === 'year'
}

function getLookupKey(tier: Tier, interval: Interval) {
  const keyMap: Record<Tier, Record<Interval, string>> = {
    rooted: {
      month: 'naturehood_rooted_month',
      year: 'naturehood_rooted_year',
    },
    canopy: {
      month: 'naturehood_canopy_month',
      year: 'naturehood_canopy_year',
    },
  }
  return keyMap[tier][interval]
}

async function requireAuthenticatedUserId() {
  const supabase = await createClient()
  const { data: authData, error } = await supabase.auth.getUser()
  if (error || !authData.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { userId: authData.user.id }
}

async function resolvePriceIdFromLookupKey(lookupKey: string) {
  const stripe = getStripeClient()
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
    expand: ['data.product'],
  })

  const price = prices.data[0]
  if (!price) {
    throw new Error(`No active Stripe price found for lookup key: ${lookupKey}`)
  }
  return price.id
}

function extractClientSecret(invoice: Stripe.Subscription['latest_invoice']) {
  if (!invoice || typeof invoice === 'string') {
    return null
  }

  const confirmation = invoice.confirmation_secret
  if (!confirmation) {
    return null
  }

  return confirmation.client_secret ?? null
}

function getSubscriptionCurrentPeriodEnd(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.current_period_end ?? null
}

async function upsertProfileBillingState(params: {
  userId: string
  customerId?: string | null
  subscriptionId?: string | null
  priceId?: string | null
  tier?: Tier | null
  interval?: Interval | null
  status?: string | null
  currentPeriodEnd?: number | null
  cancelAtPeriodEnd?: boolean | null
  lastInvoicePaidAt?: string | null
}) {
  const admin = getSupabaseAdminClient()

  const updatePayload: Record<string, unknown> = {
    subscription_updated_at: new Date().toISOString(),
  }

  if (params.customerId !== undefined) updatePayload.stripe_customer_id = params.customerId
  if (params.subscriptionId !== undefined) updatePayload.stripe_subscription_id = params.subscriptionId
  if (params.priceId !== undefined) updatePayload.stripe_price_id = params.priceId
  if (params.tier !== undefined) updatePayload.subscription_tier = params.tier
  if (params.interval !== undefined) updatePayload.subscription_interval = params.interval
  if (params.status !== undefined) updatePayload.subscription_status = params.status
  if (params.cancelAtPeriodEnd !== undefined) {
    updatePayload.subscription_cancel_at_period_end = params.cancelAtPeriodEnd
  }
  if (params.lastInvoicePaidAt !== undefined) {
    updatePayload.stripe_last_invoice_paid_at = params.lastInvoicePaidAt
  }
  if (params.currentPeriodEnd !== undefined) {
    updatePayload.subscription_current_period_end =
      params.currentPeriodEnd != null
        ? new Date(params.currentPeriodEnd * 1000).toISOString()
        : null
  }

  const { error } = await admin.from('profiles').update(updatePayload).eq('id', params.userId)
  if (error) {
    throw new Error(`Failed to update profile billing state: ${error.message}`)
  }
}

export async function createSubscription(body: CreateSubscriptionBody) {
  try {
    if (!isTier(body.tier) || !isInterval(body.interval) || !body.userId) {
      return NextResponse.json(
        { error: 'Invalid body. Expected { tier, interval, userId }' },
        { status: 400 }
      )
    }

    const auth = await requireAuthenticatedUserId()
    if (auth.error) return auth.error
    if (auth.userId !== body.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = getSupabaseAdminClient()
    const stripe = getStripeClient()

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('email,name,stripe_customer_id')
      .eq('id', body.userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const customerId = await getOrCreateCustomer({
      userId: body.userId,
      email: profile.email,
      name: profile.name,
    })

    const existing = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 20,
      expand: ['data.latest_invoice.confirmation_secret'],
    })

    const incompleteSub = existing.data.find(
      (sub) => sub.status === 'incomplete' || sub.status === 'past_due'
    )

    if (incompleteSub) {
      const clientSecret = extractClientSecret(incompleteSub.latest_invoice)
      if (clientSecret) {
        await upsertProfileBillingState({
          userId: body.userId,
          customerId,
          subscriptionId: incompleteSub.id,
          status: incompleteSub.status,
          currentPeriodEnd: getSubscriptionCurrentPeriodEnd(incompleteSub),
          cancelAtPeriodEnd: incompleteSub.cancel_at_period_end,
        })

        return NextResponse.json({
          clientSecret,
          subscriptionId: incompleteSub.id,
        })
      }
    }

    const activeLike = existing.data.find((sub) =>
      ['active', 'trialing'].includes(sub.status)
    )
    if (activeLike) {
      return NextResponse.json(
        {
          error: 'User already has an active or trialing subscription',
          subscriptionId: activeLike.id,
          status: activeLike.status,
        },
        { status: 409 }
      )
    }

    const lookupKey = getLookupKey(body.tier, body.interval)
    const priceId = await resolvePriceIdFromLookupKey(lookupKey)

    const created = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.confirmation_secret'],
      metadata: {
        userId: body.userId,
        tier: body.tier,
        interval: body.interval,
      },
    })

    const clientSecret = extractClientSecret(created.latest_invoice)
    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Unable to create payment intent for subscription' },
        { status: 500 }
      )
    }

    await upsertProfileBillingState({
      userId: body.userId,
      customerId,
      subscriptionId: created.id,
      priceId,
      tier: body.tier,
      interval: body.interval,
      status: created.status,
      currentPeriodEnd: getSubscriptionCurrentPeriodEnd(created),
      cancelAtPeriodEnd: created.cancel_at_period_end,
    })

    return NextResponse.json({
      clientSecret,
      subscriptionId: created.id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function cancelSubscription(body: CancelSubscriptionBody) {
  try {
    if (!body.userId) {
      return NextResponse.json({ error: 'Invalid body. Expected { userId }' }, { status: 400 })
    }

    const auth = await requireAuthenticatedUserId()
    if (auth.error) return auth.error
    if (auth.userId !== body.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = getSupabaseAdminClient()
    const stripe = getStripeClient()

    const { data: profile, error } = await admin
      .from('profiles')
      .select('stripe_subscription_id,stripe_customer_id')
      .eq('id', body.userId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let subscriptionId = profile.stripe_subscription_id ?? null

    if (!subscriptionId && profile.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'all',
        limit: 20,
      })
      const candidate = subscriptions.data.find((sub) =>
        ['active', 'trialing', 'past_due', 'incomplete'].includes(sub.status)
      )
      subscriptionId = candidate?.id ?? null
    }

    if (!subscriptionId) {
      return NextResponse.json({ error: 'No subscription to cancel' }, { status: 404 })
    }

    const canceledAtPeriodEnd = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    await upsertProfileBillingState({
      userId: body.userId,
      subscriptionId: canceledAtPeriodEnd.id,
      status: canceledAtPeriodEnd.status,
      currentPeriodEnd: getSubscriptionCurrentPeriodEnd(canceledAtPeriodEnd),
      cancelAtPeriodEnd: true,
    })

    return NextResponse.json({
      success: true,
      subscriptionId: canceledAtPeriodEnd.id,
      cancelAtPeriodEnd: true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function createCustomerPortal(userId: string | null) {
  try {
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId query parameter' }, { status: 400 })
    }

    const auth = await requireAuthenticatedUserId()
    if (auth.error) return auth.error
    if (auth.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = getSupabaseAdminClient()
    const stripe = getStripeClient()

    const { data: profile, error } = await admin
      .from('profiles')
      .select('email,name,stripe_customer_id')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const customerId = await getOrCreateCustomer({
      userId,
      email: profile.email,
      name: profile.name,
    })

    const returnUrl =
      process.env.STRIPE_BILLING_PORTAL_RETURN_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create portal session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
