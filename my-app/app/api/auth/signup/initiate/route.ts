import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomInt } from 'crypto'
import { Resend } from 'resend'
import { otpEmailHtml } from '@/app/components/email-template'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  const admin = createAdminClient()
  const normalizedEmail = email.trim().toLowerCase()

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingProfile) {
    return NextResponse.json(
      { error: 'An account with this email already exists. Please log in.' },
      { status: 409 }
    )
  }

  const code = randomInt(100000, 1000000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error: upsertError } = await admin
    .from('otp_codes')
    .upsert({ email: normalizedEmail, code, expires_at: expiresAt, used: false }, { onConflict: 'email' })

  if (upsertError) {
    console.error('OTP upsert error:', upsertError)
    return NextResponse.json({ error: 'Failed to generate verification code.' }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Naturehood <onboarding@resend.dev>',
    to: normalizedEmail,
    subject: 'Your Naturehood verification code',
    html: otpEmailHtml(code),
  })

  if (emailError) {
    console.error('Resend error:', JSON.stringify(emailError, null, 2))
    return NextResponse.json({ error: 'Failed to send verification email.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
