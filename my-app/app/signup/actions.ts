'use server'

import { createClient } from '@/lib/supabase/server'

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
