# Billing Integration (Stripe + Supabase)

This document covers the billing endpoints added to this app and explains all required environment variables.

## Endpoints

- `POST /api/create-subscription`
  - Body: `{ "tier": "rooted" | "canopy", "interval": "month" | "year", "userId": "uuid" }`
  - Behavior:
    - Validates session user matches `userId`.
    - Gets or creates Stripe customer.
    - Reuses existing `incomplete`/`past_due` subscription when possible.
    - Blocks creating a second `active`/`trialing` subscription.
    - Creates Stripe subscription with `payment_behavior: "default_incomplete"`.
  - Success response: `{ "clientSecret": "...", "subscriptionId": "sub_..." }`

- `POST /api/cancel-subscription`
  - Body: `{ "userId": "uuid" }`
  - Behavior:
    - Validates session user matches `userId`.
    - Sets Stripe subscription `cancel_at_period_end: true`.
    - Updates `profiles` subscription fields.
  - Success response: `{ "success": true, "subscriptionId": "sub_...", "cancelAtPeriodEnd": true }`

- `GET /api/customer-portal?userId=...`
  - Behavior:
    - Validates session user matches `userId`.
    - Creates Stripe Billing Portal session.
  - Success response: `{ "url": "https://billing.stripe.com/..." }`

- `POST /api/webhooks/stripe`
  - Behavior:
    - Reads raw request body and verifies `stripe-signature`.
    - Handles:
      - `customer.subscription.created`
      - `customer.subscription.updated`
      - `customer.subscription.deleted`
      - `invoice.payment_succeeded`
    - Uses `stripe_webhook_events` table for idempotency.
  - Success response: `{ "received": true }`

## Environment Variables

Add these to `.env.local` (and production env config).

### Stripe keys and URLs

- `STRIPE_SECRET_KEY`
  - What it does: Authenticates server-side Stripe API requests.
  - Used by: `src/utils/stripe.ts`.
  - Example: `sk_test_...`

- `STRIPE_WEBHOOK_SECRET`
  - What it does: Verifies webhook signatures so only Stripe-signed webhook calls are accepted.
  - Used by: `src/controllers/webhookController.ts`.
  - Example: `whsec_...`

- `STRIPE_BILLING_PORTAL_RETURN_URL`
  - What it does: Where Stripe Billing Portal sends the user after they click return.
  - Used by: `createCustomerPortal` in `src/controllers/subscriptionController.ts`.
  - Recommended: your account/billing settings page URL.
  - Example: `https://yourdomain.com/account`

### Stripe price lookup keys

The app uses Stripe `lookup_keys` to resolve the correct recurring Price from `(tier, interval)`.

- `STRIPE_LOOKUP_KEY_ROOTED_MONTH`
  - What it does: Lookup key for the Rooted monthly Stripe Price.
  - Example: `naturehood_rooted_month`

- `STRIPE_LOOKUP_KEY_ROOTED_YEAR`
  - What it does: Lookup key for the Rooted yearly Stripe Price.
  - Example: `naturehood_rooted_year`

- `STRIPE_LOOKUP_KEY_CANOPY_MONTH`
  - What it does: Lookup key for the Canopy monthly Stripe Price.
  - Example: `naturehood_canopy_month`

- `STRIPE_LOOKUP_KEY_CANOPY_YEAR`
  - What it does: Lookup key for the Canopy yearly Stripe Price.
  - Example: `naturehood_canopy_year`

### Supabase variables (already used in app)

- `NEXT_PUBLIC_SUPABASE_URL`
  - What it does: Base URL of your Supabase project.
  - Used by: Supabase clients including admin billing writes.

- `SUPABASE_SERVICE_ROLE_KEY`
  - What it does: Service-role key for server-side admin writes that bypass RLS.
  - Used by: `src/utils/supabaseAdmin.ts`.
  - Important: Never expose to browser/client code.

- `NEXT_PUBLIC_SITE_URL`
  - What it does: Fallback site URL (used when `STRIPE_BILLING_PORTAL_RETURN_URL` is not set).

## Stripe Dashboard Setup

1. Create four recurring Prices in Stripe for:
   - Rooted monthly
   - Rooted yearly
   - Canopy monthly
   - Canopy yearly
2. Set each Price's `lookup_key` to match the env vars above.
3. Configure Stripe Billing Portal in Dashboard.
4. Add webhook endpoint:
   - URL: `https://<your-domain>/api/webhooks/stripe`
   - Events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
5. Copy webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Local Webhook Testing

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Copy the emitted `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

## Install Command

```bash
npm install stripe@latest @supabase/supabase-js@latest
```
