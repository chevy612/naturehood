import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk'

const expo = new Expo()

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.NOTIFICATIONS_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, userIds, title, body, data } = await req.json()

  const targetUserIds: string[] = userId ? [userId] : (userIds ?? [])
  if (targetUserIds.length === 0) {
    return NextResponse.json({ error: 'Missing userId or userIds' }, { status: 400 })
  }
  if (!title || !body) {
    return NextResponse.json({ error: 'Missing title or body' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: tokens, error } = await admin
    .from('push_tokens')
    .select('expo_push_token, device_id, user_id')
    .in('user_id', targetUserIds)

  if (error) {
    console.error('Failed to fetch push tokens:', error)
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
  }

  const validTokens = tokens.filter(t => Expo.isExpoPushToken(t.expo_push_token))
  if (validTokens.length === 0) {
    return NextResponse.json({ success: true, sent: 0 })
  }

  const messages: ExpoPushMessage[] = validTokens.map(t => ({
    to: t.expo_push_token,
    title,
    body,
    data: data ?? {},
    sound: 'default',
  }))

  const chunks = expo.chunkPushNotifications(messages)
  const tickets: ExpoPushTicket[] = []

  for (const chunk of chunks) {
    const chunkTickets = await expo.sendPushNotificationsAsync(chunk)
    tickets.push(...chunkTickets)
  }

  // Clean up invalid tokens
  const invalidTokens: string[] = []
  tickets.forEach((ticket, i) => {
    if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
      invalidTokens.push(validTokens[i].expo_push_token)
    }
  })

  if (invalidTokens.length > 0) {
    await admin
      .from('push_tokens')
      .delete()
      .in('expo_push_token', invalidTokens)
  }

  return NextResponse.json({ success: true, sent: validTokens.length, tickets })
}
