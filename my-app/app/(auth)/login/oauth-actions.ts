'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function signInWithOAuth(provider: 'google' | 'apple') {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return { url: data.url }
}
