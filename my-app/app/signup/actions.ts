'use server'

import { createClient } from '@/lib/supabase/server'

interface SignUpData {
  email: string
  password: string
  repeatPassword: string
  username: string
  isBusiness: boolean
}

interface AthleteSignUpData {
  fullName: string;
  email: string;
  phone: string;
  sport: string;
  instagram: string;
  followers: string;
  location: string;
  yearsExperience: string;
  projectIdea: string;
  portfolio: string;
  availability: string;
  hearAboutUs: string;
}

interface BrandSignUpData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  teamSize: string;
  budget: string;
  timeline: string;
  projectIdea: string;
  goals: string;
  targetAudience: string;
  feedback: string;
}

export async function signUpAthlete(data: AthleteSignUpData) {
  const supabase = await createClient()

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { error: 'Please enter a valid email address' }
  }

  try {
    // For now, just store the application data
    // You can extend this to create auth user later
    const { error: insertError } = await supabase
      .from('athlete_applications')
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        sport: data.sport,
        instagram: data.instagram,
        followers: data.followers,
        location: data.location,
        years_experience: data.yearsExperience,
        project_idea: data.projectIdea,
        portfolio: data.portfolio,
        availability: data.availability,
        hear_about_us: data.hearAboutUs,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Athlete application error:', insertError)
      return { error: 'Failed to submit application. Please try again.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function signUpBrand(data: BrandSignUpData) {
  const supabase = await createClient()

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return { error: 'Please enter a valid email address' }
  }

  try {
    // Store the brand partnership inquiry
    const { error: insertError } = await supabase
      .from('brand_applications')
      .insert({
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        website: data.website,
        industry: data.industry,
        team_size: data.teamSize,
        budget: data.budget,
        timeline: data.timeline,
        project_idea: data.projectIdea,
        goals: data.goals,
        target_audience: data.targetAudience,
        feedback: data.feedback,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Brand application error:', insertError)
      return { error: 'Failed to submit inquiry. Please try again.' }
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
