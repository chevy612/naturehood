import { NextRequest } from 'next/server'
import { createSubscription } from '@/src/controllers/subscriptionController'

export async function POST(req: NextRequest) {
  const body = await req.json()
  return createSubscription(body)
}
