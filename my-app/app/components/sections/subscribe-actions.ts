'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import {
  communityWelcomeEmailHtml,
  newSubscriberNotificationEmailHtml,
} from '@/app/components/email-template'
import logger from '@/lib/logger'

const TEAM_EMAIL = process.env.TEAM_NOTIFICATION_EMAIL ?? 'team@naturehoodofficial.com'

type SubscribeResult = { ok: true; message: string } | { ok: false; error: string }

/**
 * Community "Join us" capture. Stores the email in `subscribed_email`, then
 * (for a genuinely new subscriber) sends a welcome email and notifies the team.
 * Duplicate emails are treated idempotently — no error, no re-send.
 */
export async function subscribeToCommunity(rawEmail: string): Promise<SubscribeResult> {
  const email = (rawEmail ?? '').trim().toLowerCase()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { ok: false, error: 'Please enter a valid email address' }
  }

  const admin = createAdminClient()
  const { error: insertError } = await admin.from('subscribed_email').insert({ email })

  if (insertError) {
    // 23505 = unique_violation → this email already subscribed.
    if (insertError.code === '23505') {
      return {
        ok: true,
        message: 'You have already signed up. You have already joined the community.',
      }
    }
    logger.error('Subscribe insert error:', insertError)
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }

  // New subscriber → send emails best-effort. A send failure must never lose
  // the subscriber (the row is already committed), so we log and move on.
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM_EMAIL ?? 'Naturehood <onboarding@resend.dev>'

  try {
    const { error: welcomeError } = await resend.emails.send({
      from,
      to: email,
      subject: 'Welcome to Naturehood',
      html: communityWelcomeEmailHtml(),
    })
    if (welcomeError) logger.error('Welcome email failed:', welcomeError)

    const { error: notifyError } = await resend.emails.send({
      from,
      to: TEAM_EMAIL,
      replyTo: email,
      subject: `New community member: ${email}`,
      html: newSubscriberNotificationEmailHtml(email),
    })
    if (notifyError) logger.error('Team notification failed:', notifyError)
  } catch (err) {
    logger.error('Resend send threw:', err)
  }

  return { ok: true, message: "You're in. We'll be in touch." }
}
