'use server'

import { withServerAction } from '@/lib/observability/with-server-action'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

async function signInWithOAuthImpl(provider: 'google' | 'apple') {
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

export async function signInWithOAuth(...args: Parameters<typeof signInWithOAuthImpl>): Promise<Awaited<ReturnType<typeof signInWithOAuthImpl>>> {
  return withServerAction('signInWithOAuth', () => signInWithOAuthImpl(...args))
}
