import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export type AuthenticatedSocialClient = {
  supabase: SupabaseClient
  userId: string
}

export async function getAuthenticatedSocialClient(
  request: NextRequest
): Promise<AuthenticatedSocialClient | null> {
  const authorization = request.headers.get('authorization')
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length).trim() : null
  const supabase = token
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      )
    : await createServerClient()

  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (error || typeof userId !== 'string') return null
  return { supabase, userId }
}

