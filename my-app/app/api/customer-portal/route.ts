import { NextRequest } from 'next/server'
import { createCustomerPortal } from '@/src/controllers/subscriptionController'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  return createCustomerPortal(userId)
}
