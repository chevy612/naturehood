'use server'

import { withServerAction } from '@/lib/observability/with-server-action'

import { createClient } from '@/lib/supabase/server'

interface LoginData {
  emailOrUsername: string
  password: string
}

async function loginUserImpl(data: LoginData) {
  const supabase = await createClient()

  const { emailOrUsername, password } = data

  // Validate input
  if (!emailOrUsername || !password) {
    return { error: 'Email/Username and password are required' }
  }

  try {
    let email = emailOrUsername

    // Check if input is a username (not an email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailOrUsername)) {
      // It's a username, so we need to look up the email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', emailOrUsername.trim())
        .single()

      if (profileError || !profile) {
        return { error: 'Invalid username or password' }
      }

      email = profile.email
    }

    // Sign in with email and password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return { error: 'Invalid email or password' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected login error:', error)
    return { error: 'An unexpected error occurred during login' }
  }
}

export async function loginUser(...args: Parameters<typeof loginUserImpl>): Promise<Awaited<ReturnType<typeof loginUserImpl>>> {
  return withServerAction('loginUser', () => loginUserImpl(...args))
}
