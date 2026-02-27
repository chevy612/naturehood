'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

// ─────────────────────────────────────────────
// QUICK SIGN UP
// ─────────────────────────────────────────────

interface QuickSignUpData {
  fullName: string
  email: string
  role: 'athlete' | 'brand' | 'other'
  agreeTerms: boolean
  receiveNews: boolean
}

export async function quickSignUp(data: QuickSignUpData) {
  const supabase = await createClient()

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

  try {
    const { error: insertError } = await supabase
      .from('quick_signups')
      .insert({
        full_name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        role: data.role,
        agree_terms: data.agreeTerms,
        receive_news: data.receiveNews,
      })

    if (insertError) {
      console.error('Quick signup error:', insertError)

      if (insertError.code === '23505') {
        return { error: 'This email is already registered.' }
      }

      return { error: 'Failed to sign up. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// ─────────────────────────────────────────────
// EXISTING SIGN UP ACTIONS
// ─────────────────────────────────────────────

interface SignUpData {
  email: string
  password: string
  repeatPassword: string
  username: string
  isBusiness: boolean
}



interface BrandPartnershipData {
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
  contactName: string;
  jobTitle: string;
  email: string;
  phone: string;
  partnershipTypes: string[];
  athleteInterests: string;
  budget: string;
  timeline: string;
  additionalInfo: string;
}





export async function submitBrandPartnership(data: BrandPartnershipData) {
  const supabase = await createClient()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { error: 'Please enter a valid email address' }
  }

  try {
    const { error: insertError } = await supabase
      .from('brand_applications')
      .insert({
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        team_size: data.companySize,
        budget: data.budget,
        timeline: data.timeline,
        project_idea: data.additionalInfo,
        target_audience: data.athleteInterests,
        job_title: data.jobTitle,
        company_size: data.companySize,
        partnership_types: data.partnershipTypes,
        athlete_interests: data.athleteInterests,
        additional_info: data.additionalInfo,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Brand partnership error:', insertError)
      return { error: 'Failed to submit application. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// ─────────────────────────────────────────────
// OTP SIGN UP FLOW
// ─────────────────────────────────────────────

interface InitiateSignUpData {
  fullName: string
  email: string
  role: 'athlete' | 'brand' | 'other'
  receiveNews: boolean
  agreeTerms: boolean
}

export async function initiateSignUp(data: InitiateSignUpData) {
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
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Remove any existing codes for this email and insert the new one
  await admin.from('otp_codes').delete().eq('email', email)
  const { error: insertError } = await admin
    .from('otp_codes')
    .insert({ email, code, expires_at: expiresAt })

  if (insertError) {
    console.error('OTP insert error:', insertError)
    return { error: 'Failed to generate verification code. Please try again.' }
  }

  // Send via Resend
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailError } = await resend.emails.send({
    from: 'Naturehood <onboarding@resend.dev>',
    to: email,
    subject: 'Your Naturehood verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #141115;">Verify your email</h2>
        <p style="color: #444;">Enter this code to continue creating your Naturehood account:</p>
        <div style="font-size: 40px; font-weight: bold; letter-spacing: 0.2em; color: #141115; margin: 24px 0;">${code}</div>
        <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  })

  if (emailError) {
    console.error('Email send error:', emailError)
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

  if (data.password !== data.confirmPassword) {
    return { error: 'Passwords do not match' }
  }
  if (data.password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  const email = data.email.trim().toLowerCase()

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

  await supabase.from('profiles').upsert({
    id: authData.user.id,
    email,
    is_business: data.role === 'brand',
    updated_at: new Date().toISOString(),
  })

  return { success: true }
}

export async function signUpNewUser(data: SignUpData) {
  const supabase = await createClient()

  const { email, password, repeatPassword, username, isBusiness } = data

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid email address' }
  }

  // Validate passwords match
  if (password !== repeatPassword) {
    return { error: 'Passwords do not match' }
  }

  // Validate password strength (minimum 6 characters)
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long' }
  }

  // Validate username
  if (!username || username.trim().length < 3) {
    return { error: 'Username must be at least 3 characters long' }
  }

  try {
    // Check if username already exists (use count to bypass RLS)
    const { count, error: checkError } = await supabase
      .from('profiles')
      .select('username', { count: 'exact', head: true })
      .eq('username', username.trim())

    if (checkError) {
      console.error('Error checking username:', checkError)
      return { error: 'Unable to verify username availability' }
    }

    if (count && count > 0) {
      return { error: 'Username is already taken. Please choose another one.' }
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        // Store username and business status in user metadata
        data: {
          username: username.trim(),
          is_business: isBusiness,
          email_confirm: true
        }
      },
    })

    if (authError) {
      return { error: authError.message }
    }

    // If signup successful and we have a user ID, create profile entry
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username.trim(),
          is_business: isBusiness,
          email: email,
          updated_at: new Date().toISOString(),
        })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't return error here - user is created, profile can be added later
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected signup error:', error)
    return { error: 'An unexpected error occurred during signup' }
  }
}
