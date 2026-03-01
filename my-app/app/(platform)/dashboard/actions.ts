'use server'

import { createClient } from '@/lib/supabase/server'
import { RESERVED_SLUGS } from '@/lib/username'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const newUsername = (formData.get('username') as string ?? '').trim().toLowerCase()
  const bio = (formData.get('bio') as string ?? '').trim()

  if (!/^[a-z0-9]+$/.test(newUsername)) {
    return { error: 'Username can only contain lowercase letters and numbers.' }
  }

  if (RESERVED_SLUGS.has(newUsername)) {
    return { error: 'That username is reserved. Please choose another.' }
  }

  // Check uniqueness — exclude the current user
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', newUsername)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    return { error: 'Username is already taken.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username: newUsername, bio, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to save. Please try again.' }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
