'use server'

import { randomBytes } from 'crypto'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { passwordResetEmailHtml } from '@/app/components/email-template'

export async function requestPasswordReset(
  email: string
): Promise<{ success: true } | { error: string }> {
  const normalized = email.trim().toLowerCase()

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalized)) {
    return { error: 'Please enter a valid email address.' }
  }

  const admin = createAdminClient()

  // Rate limit: max 3 requests per email per rolling hour
  const { count } = await admin
    .from('password_reset_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('email', normalized)
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

  if ((count ?? 0) >= 3) {
    // Silently succeed — don't reveal rate limiting to potential attackers
    return { success: true }
  }

  // Check if account exists (but don't reveal the result to the caller)
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', normalized)
    .maybeSingle()

  if (profile) {
    // Invalidate any previous tokens for this email
    await admin
      .from('password_reset_tokens')
      .delete()
      .eq('email', normalized)

    // Generate a cryptographically secure token (256-bit entropy)
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const { error: insertError } = await admin
      .from('password_reset_tokens')
      .insert({ email: normalized, token, expires_at: expiresAt, used: false })

    if (insertError) {
      console.error('password_reset_tokens insert error:', insertError)
      return { error: 'Something went wrong. Please try again.' }
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const resetUrl = `${siteUrl}/auth/reset-password?token=${token}`

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        'Naturehood <onboarding@resend.dev>',
      to: normalized,
      subject: 'Reset your Naturehood password',
      html: passwordResetEmailHtml(resetUrl),
    })

    if (emailError) {
      console.error('Resend password reset email error:', emailError)
      // Don't expose email failure — token is in DB; user can request again
    }
  }

  // Always return success to prevent email enumeration
  return { success: true }
}
