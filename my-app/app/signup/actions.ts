'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUpNewUser(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const repeatPassword = formData.get('repeatPassword') as string

  // Validate passwords match
  if (password !== repeatPassword) {
    return { error: 'Passwords do not match' }
  }

  // Validate password strength (minimum 6 characters)
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long' }
  }

  // Sign up the user
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/protected`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect to success page
  redirect('/auth/sign-up-success')
}
