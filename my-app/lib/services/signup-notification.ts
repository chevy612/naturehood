import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'
import { newUserSignupNotificationEmailHtml } from '@/app/components/email-template'
import logger from '@/lib/logger'
import { tracedEmailSend } from '@/lib/observability/dependencies'

const SIGNUP_NOTIFICATION_EMAIL =
  process.env.SIGNUP_NOTIFICATION_EMAIL ?? 'cc@naturehoodofficial.com'

interface NewSignup {
  name: string
  email: string
  username?: string | null
  role?: string | null
  method: string
}

/**
 * Emails the team about a newly created account, including the current total
 * user count. Best-effort: never throws, so a send failure can't break signup.
 * Call it inside `after()` so it doesn't delay the signup response.
 */
export async function notifyNewSignup(admin: SupabaseClient, signup: NewSignup): Promise<void> {
  try {
    const { count, error: countError } = await admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
    if (countError) logger.error('Signup notification: user count failed:', countError)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const envTag = process.env.NODE_ENV === 'production' ? '' : '[DEV] '
    const { error } = await tracedEmailSend(() => resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'Naturehood <onboarding@resend.dev>',
      to: SIGNUP_NOTIFICATION_EMAIL,
      replyTo: signup.email,
      subject: `${envTag}New user signup: ${signup.name} (${count ?? '?'} total users)`,
      html: newUserSignupNotificationEmailHtml({
        ...signup,
        signedUpAt: new Date(),
        totalUsers: count ?? null,
      }),
    }))
    if (error) logger.error('Signup notification email failed:', error)
  } catch (err) {
    logger.error('Signup notification threw:', err)
  }
}
