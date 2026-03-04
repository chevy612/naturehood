'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateUniqueUsername } from '@/lib/username'
import { randomInt } from 'crypto'
import { Resend } from 'resend'
import { otpEmailHtml } from '@/app/components/email-template'

// ─────────────────────────────────────────────
// SHARED INTERFACE
// ─────────────────────────────────────────────

interface SignUpFormData {
  fullName: string
  email: string
  role: 'athlete' | 'brand' | 'other'
  agreeTerms: boolean
  receiveNews: boolean
}

// ─────────────────────────────────────────────
// OTP SIGN UP FLOW
// initiateSignUp → verifySignUpOtp → setUserPassword
// ─────────────────────────────────────────────

export async function initiateSignUp(data: SignUpFormData) {
  const admin = createAdminClient()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { error: 'Please enter a valid email address' }
  }
  if (!data.fullName.trim()) {
    return { error: 'Please enter your full name' }
  }
  if (!data.agreeTerms) {
    return { error: 'You must agree to the Terms of Service' }
  }

  const email = data.email.trim().toLowerCase()

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile) {
    return { error: 'An account with this email already exists. Please log in.' }
  }

  const code = randomInt(100000, 1000000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error: upsertError } = await admin
    .from('otp_codes')
    .upsert(
      { email, code, expires_at: expiresAt, used: false },
      { onConflict: 'email' }
    )

  if (upsertError) {
    console.error('OTP upsert error:', upsertError)
    return { error: 'Failed to generate verification code. Please try again.' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Naturehood <onboarding@resend.dev>',
    to: email,
    subject: 'Your Naturehood verification code',
    html: otpEmailHtml(code),
  })

  if (emailError) {
    console.error('Resend email error:', JSON.stringify(emailError, null, 2))
    return { error: 'Failed to send verification email. Please try again.' }
  }

  return { success: true }
}

export async function verifySignUpOtp(email: string, token: string) {
  const admin = createAdminClient()

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedToken = token.trim()

  const { data: record, error: queryError } = await admin
    .from('otp_codes')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('code', normalizedToken)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (queryError || !record) {
    return { error: 'Invalid or expired code. Please try again.' }
  }

  await admin.from('otp_codes').update({ used: true }).eq('id', record.id)

  return { success: true }
}

interface SetPasswordData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  role: 'athlete' | 'brand' | 'other'
}

export async function setUserPassword(data: SetPasswordData) {
  const supabase = await createClient()
  const admin = createAdminClient()

  if (data.password !== data.confirmPassword) {
    return { error: 'Passwords do not match' }
  }
  if (data.password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const email = data.email.trim().toLowerCase()

  const { data: verifiedOtp } = await admin
    .from('otp_codes')
    .select('id')
    .eq('email', email)
    .eq('used', true)
    .maybeSingle()

  if (!verifiedOtp) {
    return { error: 'Email verification required. Please complete the verification step.' }
  }

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        role: data.role,
      },
    },
  })

  if (signUpError) {
    console.error('Sign up error:', signUpError)
    return { error: signUpError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create account. Please try again.' }
  }

  const username = await generateUniqueUsername(data.fullName)

  const { error: profileError } = await admin.from('profiles').upsert({
    id: authData.user.id,
    email,
    name: data.fullName,
    role: data.role,
    username,
    updated_at: new Date().toISOString(),
  })
  

  if (profileError) {
    console.error('Profile upsert error:', profileError)
    return { error: 'Account created but profile setup failed. Please contact support.' }
  }

  await admin.from('otp_codes').delete().eq('email', email)

  return { success: true }
}
