import { NextRequest } from 'next/server'
import { cancelSubscription } from '@/src/controllers/subscriptionController'

export async function POST(req: NextRequest) {
  const body = await req.json()
  return cancelSubscription(body)
}
