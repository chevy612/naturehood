import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedCode = code.trim()

  const { data: record, error: queryError } = await admin
    .from('otp_codes')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('code', normalizedCode)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (queryError || !record) {
    return NextResponse.json({ error: 'Invalid or expired code. Please try again.' }, { status: 400 })
  }

  await admin.from('otp_codes').update({ used: true }).eq('id', record.id)

  return NextResponse.json({ success: true })
}
