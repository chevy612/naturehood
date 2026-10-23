'use server'

import { withServerAction } from '@/lib/observability/with-server-action'

import { createClient } from '@/lib/supabase/server'
import { RESERVED_SLUGS } from '@/lib/username'
import { redirect } from 'next/navigation'
import { tracedStorageUpload } from '@/lib/observability/dependencies'
import {
  isEthnicityValue,
  isGenderValue,
  parseHeightInput,
  parseWeightInput,
  type HeightUnit,
  type WeightUnit,
} from '@/lib/profile/body-metrics'

async function updateProfileImpl(formData: FormData) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub
  if (!userId) redirect('/login')

  const name = (formData.get('name') as string ?? '').trim()
  const newUsername = (formData.get('username') as string ?? '').trim().toLowerCase()
  const bio = (formData.get('bio') as string ?? '').trim()
  const genderRaw = (formData.get('gender') as string ?? '').trim()
  const ethnicityRaw = (formData.get('ethnicity') as string ?? '').trim()
  const weightRaw = (formData.get('weight') as string ?? '').trim()
  const heightRaw = (formData.get('height') as string ?? '').trim()
  const weightUnit = (formData.get('weight_unit') as WeightUnit) === 'lb' ? 'lb' : 'kg'
  const heightUnit = (formData.get('height_unit') as HeightUnit) === 'in' ? 'in' : 'cm'

  const gender = genderRaw === '' ? null : genderRaw
  if (gender !== null && !isGenderValue(gender)) {
    return { error: 'Please choose a valid gender option.' }
  }

  const ethnicity = ethnicityRaw === '' ? null : ethnicityRaw
  if (ethnicity !== null && !isEthnicityValue(ethnicity)) {
    return { error: 'Please choose a valid ethnicity option.' }
  }

  const weightParsed = parseWeightInput(weightRaw, weightUnit)
  if ('error' in weightParsed) return { error: weightParsed.error }

  const heightParsed = parseHeightInput(heightRaw, heightUnit)
  if ('error' in heightParsed) return { error: heightParsed.error }

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
    .neq('id', userId)
    .maybeSingle()

  if (existing) {
    return { error: 'Username is already taken.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      name,
      username: newUsername,
      bio,
      gender,
      ethnicity,
      weight_kg: weightParsed.kg,
      height_cm: heightParsed.cm,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Profile update error:', error)
    return { error: 'Failed to save. Please try again.' }
  }

  return { success: true }
}

async function uploadAvatarImpl(formData: FormData): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data: authData2 } = await supabase.auth.getClaims()
  const userId2 = authData2?.claims?.sub
  if (!userId2) redirect('/login')

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
  const path = `${userId2}/avatar`

  const { error: uploadError } = await tracedStorageUpload(
    () => supabase.storage.from('avatars').upload(path, arrayBuffer, { contentType: file.type, upsert: true }),
    'avatars',
  )

  if (uploadError) {
    console.error('Avatar upload error:', uploadError)
    return { error: 'Upload failed. Please try again.' }
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
  const publicUrl = urlData.publicUrl + `?t=${Date.now()}`

  const { error: dbError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', userId2)

  if (dbError) {
    console.error('Avatar DB update error:', dbError)
    return { error: 'Failed to save avatar. Please try again.' }
  }

  return { url: publicUrl }
}

async function signOutImpl() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateProfile(...args: Parameters<typeof updateProfileImpl>): Promise<Awaited<ReturnType<typeof updateProfileImpl>>> {
  return withServerAction('updateProfile', () => updateProfileImpl(...args))
}


export async function uploadAvatar(...args: Parameters<typeof uploadAvatarImpl>): Promise<Awaited<ReturnType<typeof uploadAvatarImpl>>> {
  return withServerAction('uploadAvatar', () => uploadAvatarImpl(...args))
}


export async function signOut(...args: Parameters<typeof signOutImpl>): Promise<Awaited<ReturnType<typeof signOutImpl>>> {
  return withServerAction('signOut', () => signOutImpl(...args))
}
