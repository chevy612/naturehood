import 'server-only'

import Stripe from 'stripe'
import { getSupabaseAdminClient } from '@/src/utils/supabaseAdmin'

let stripeClient: Stripe | null = null

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY')
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey)
  }

  return stripeClient
}

type CustomerInput = {
  userId: string
  email?: string | null
  name?: string | null
}

export async function getOrCreateCustomer({ userId, email, name }: CustomerInput) {
  const admin = getSupabaseAdminClient()
  const stripe = getStripeClient()

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Failed to load profile: ${profileError.message}`)
  }

  const existingCustomerId = profile?.stripe_customer_id
  if (existingCustomerId) {
    return existingCustomerId
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: name ?? undefined,
    metadata: { userId },
  })

  const { error: updateError } = await admin
    .from('profiles')
    .update({
      stripe_customer_id: customer.id,
      subscription_updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    throw new Error(`Failed to persist stripe_customer_id: ${updateError.message}`)
  }

  return customer.id
}
