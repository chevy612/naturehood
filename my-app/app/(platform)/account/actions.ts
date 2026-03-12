'use server'

import { createClient } from '@/lib/supabase/server'
import { RESERVED_SLUGS } from '@/lib/username'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string ?? '').trim()
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
    .update({ name, username: newUsername, bio, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to save. Please try again.' }
  }

  return { success: true }
}

export async function uploadAvatar(formData: FormData): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { error: 'No file provided.' }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Only JPEG, PNG, and WebP images are allowed.' }
  }

  const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
  if (file.size > MAX_BYTES) {
    return { error: 'Image must be smaller than 2 MB.' }
  }

  const arrayBuffer = await file.arrayBuffer()
  const path = `${user.id}/avatar`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('Avatar upload error:', uploadError)
    return { error: 'Upload failed. Please try again.' }
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
  const publicUrl = urlData.publicUrl

  const { error: dbError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (dbError) {
    console.error('Avatar DB update error:', dbError)
    return { error: 'Failed to save avatar. Please try again.' }
  }

  return { url: publicUrl }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
